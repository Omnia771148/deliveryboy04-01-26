import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/db";
import AcceptedOrder from "../../../../models/AcceptedOrder";

export async function GET() {
  try {
    await connectionToDatabase();

    const orders = await AcceptedOrder.find({}).lean();

    return NextResponse.json(orders);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}
