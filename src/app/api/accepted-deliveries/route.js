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