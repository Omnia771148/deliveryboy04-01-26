import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/db";
import AcceptedByDelivery from "../../../../models/AcceptedByDelivery";

export async function GET() {
  try {
    await connectionToDatabase();

    const deliveries = await AcceptedByDelivery.find({})
      .sort({ acceptedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error("Fetch deliveries error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

// ✅ UPDATED POST LOGIC TO STOP MILLISECOND COLLISIONS
export async function POST(req) {
  try {
    await connectionToDatabase();
    
    // We get the full order body from the request
    const body = await req.json();
    const { orderId, deliveryBoyId } = body;

    // 1. Check if this specific delivery boy already has an active order
    // Status must not be "Delivered" for them to be considered "Busy"
    const boyIsBusy = await AcceptedByDelivery.findOne({ 
      deliveryBoyId: deliveryBoyId, 
      status: { $ne: "Delivered" } 
    });

    if (boyIsBusy) {
      return NextResponse.json(
        { success: false, message: "You already have an active delivery!" }, 
        { status: 400 }
      );
    }

    // 2. ATOMIC OPERATION: Try to create the record
    // Because 'orderId' is marked as UNIQUE in your model, 
    // the database will physically block two people from saving the same orderId.
    try {
      const newAcceptedOrder = new AcceptedByDelivery({
        ...body, // Spreads all order data into the new document
        acceptedAt: new Date(),
        status: "Accepted by Delivery"
      });

      // This line is the physical "Lock". MongoDB will handle the queue.
      await newAcceptedOrder.save();

      return NextResponse.json({ 
        success: true, 
        message: "Order accepted successfully!" 
      });

    } catch (dbError) {
      // ✅ Check for MongoDB Duplicate Key Error (Code 11000)
      // This triggers if another boy saved the exact same orderId a millisecond before you
      if (dbError.code === 11000) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Too late! Another delivery boy just accepted this order." 
          }, 
          { status: 409 } // 409 means 'Conflict'
        );
      }
      throw dbError; // Rethrow other database errors
    }

  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" }, 
      { status: 500 }
    );
  }
}