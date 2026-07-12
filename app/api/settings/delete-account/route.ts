import { NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import { deleteUserAccount } from "@/lib/server/services/userService";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await deleteUserAccount(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete account error:", err);
    return NextResponse.json({ error: "Something went wrong deleting your account." }, { status: 500 });
  }
}
