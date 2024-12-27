import ChatWrapper from "@/components/chat/ChatWrapper";
import PDFRenderer from "@/components/PDFRenderer";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Angry } from 'lucide-react';

interface PageProps {
  params: {
    fileId: string
  }
}

const Page = async ({ params }: PageProps) => {

  const { fileId } = params

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    redirect(`/auth-callback?origin=dashboard/${fileId}`)
  }

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId: user.id
    },
  })

  if (!file) {
    notFound()
  }

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh)-3.5rem]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* left */}
        <div className="flex-1 xl:flex">
          <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
            <PDFRenderer url={file.url}/>
            {/* <PDFRenderer url="https://pdfobject.com/pdf/sample-3pp.pdf" /> */}
          </div>
        </div>

        {/* right */}
        <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
          <ChatWrapper fileId={file.id} />
        </div>

        {/* remove after fixing database issue */}
        {/* <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0 flex items-center justify-center h-screen'>
          <div className='flex flex-col items-center'>
            <div className='flex gap-2 items-center'>
              <Angry className="text-red-500" height={60} width={60} />
              <h2 className="text-2xl font-bold text-red-500 flex gap-2">
                [Functionality Issue]
              </h2>
            </div>
            <p className='text-gray-500 text-center mt-2'>
              This feature is currently disabled due to a database issue.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Page