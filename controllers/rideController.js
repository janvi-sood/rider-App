const Ride = require('../model/ride');
const random = require('random-token');


const rideController = {

    bookRide : async (request, h) => {
  try {
    
    const { credentials } = request.auth;
    const userId  = credentials._id;
    console.log(userId)
    

    var ride = new Ride(request.payload);
    ride.userId = userId;
    ride.userName = credentials.userName;
    ride.userPhoneNo = credentials.userPhoneNo; 
     
    console.log(ride)
   var result =  await ride.save();
  console.log("save")
   
    return h.response({ message: 'Ride booked successfully....wait for driver acceptance' ,result});
 
} catch (error) {
    return h.response({ error: 'Error creating ride' }).code(500);
  }
},


myRides : async (request, h) => {
  try { 
    const { credentials } = request.auth  ;
    const userId  = credentials._id;
    console.log(credentials)
    console.log(userId)
    const rides = await Ride.find({userId}) ;
    console.log(rides)

    console.log('received')
    return h.response(rides);
  } catch (error) { 
    return h.response({ error: 'Error' }).code(500);
  }
},

cancelRide : async (request, h) => {
  try {
    const { rideId } = request.params;
    console.log(rideId)
    const userId = request.auth.credentials._id;

    const ride = await Ride.findOne({ _id: rideId, userId });

    if (!ride) {
      return h.response({ error: 'Ride does not exist' });
    }
    if (ride.rideStatus === 'cancelled') {
      return h.response({ error: 'Ride already cancelled' });
    }

    ride.rideStatus = 'cancelled';
    await ride.save();

    return h.response({ message: 'Ride cancelled successfully' });
  } catch (error) {
    return h.response({ error: 'Error cancelling ride' });
  }
},

 acceptRide : async (request, h) => {
  try {
    const { rideId } = request.params;
    const driverId = request.auth.credentials._id;
    const driverName = request.auth.credentials.driverName ;
    const driverContact = request.auth.credentials.driverContact ;  
 
    const ride = await Ride.findById({_id : rideId});

    if (!ride) {
      return h.response({ error: 'Ride not found' }).code(404);
    }

    if (ride.rideStatus !== 'pending') {
      return h.response({ error: 'Ride is not available for acceptance' }).code(400);
    }
    ride.rideStatus = 'accepted';
    ride.driverId = driverId;
    ride.driverName = driverName ; 
    ride.driverContact = driverContact ; 
    await ride.save();

    return h.response({ message: 'Ride accepted successfully' });
  } catch (error) {
    return h.response({ error: 'Error accepting ride' });
  }
},

updateRideStatus : async (request, h) => {
  try {
    const { rideId } = request.params;
    const driverId = request.auth.credentials._id;
    const { newStatus } = request.payload; 

    const ride = await Ride.findById({_id : rideId});
    
    if (!ride) {
      return h.response({ error: 'Ride not found' });
    }

   if (!['completed', 'cancelled'].includes(newStatus)) {
      return h.response({ error: 'Invalid update' });
    }  

    ride.rideStatus = newStatus;
    await ride.save();

    return h.response({ message: `Ride status updated to ${newStatus}` }).code(200);
  } catch (error) {
    return h.response({ error: 'Error updating ride status' }).code(500);
  }
} ,
driverRides : async(request, h) =>{
  try { 
    const { credentials } = request.auth  ;
    const driverId  = credentials._id;
    //console.log(credentials)
    //console.log(driverId)
    const rides = await Ride.find({driverId}) ;
   
     console.log('received')
      return h.response(rides);
   
  } catch (error) { 
    return h.response({ error: 'Error' }).code(500);
  }
},
};
module.exports = rideController 
