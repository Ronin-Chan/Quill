import { db } from "@/db"
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator"
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextRequest } from "next/server"

export const POST = async (req: NextRequest) => {
  const { body } = req

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  const { id: userId } = user as KindeUser

  if(!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { fileId, message } = SendMessageValidator.parse(body)

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId
    },
  })

  if (!file) {
    return new Response('Not found', { status: 404 })
  }

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId
    },
  })
}