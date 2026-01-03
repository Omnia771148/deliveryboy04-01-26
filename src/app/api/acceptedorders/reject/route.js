import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/db";
import AcceptedOrder from "../../../../../models/AcceptedOrder";

export async function POST(req) {
  try {
    await connectionToDatabase();

    const { orderId, deliveryBoyId } = await req.json();

    if (!orderId || !deliveryBoyId) {
      return NextResponse.json(
        { message: "Missing data" },
        { status: 400 }
      );
    }

    await AcceptedOrder.updateOne(
      { _id: orderId },
      {
        $addToSet: {
          rejectedBy: deliveryBoyId, // ✅ FIX
        },
      }
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Reject failed" },
      { status: 500 }
    );
  }
}
