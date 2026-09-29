// app/api/users/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb";
import { User } from "@/utils/userSchema";

export async function POST(request: Request) {
    try {
        await connectDB();

        const data = await request.json();

        // console.log(data);

        const user = await User.create(data);

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to save data",
            },
            { status: 500 }
        );
    }
}