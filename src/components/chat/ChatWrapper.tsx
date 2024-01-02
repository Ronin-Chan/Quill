"use client"

import { trpc } from "@/app/_trpc/client"
import ChatInput from "./ChatInput"
import Message from "./Message"
import { ChevronLeft, Frown, Loader2 } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "../ui/button"

const ChatWrapper = ({ fileId }: { fileId: string }) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery({
    fileId
  }, {
    refetchInterval: (data) =>
      data?.status === 'SUCCESS' || data?.status === 'FAILED' ? false : 500
  })

  if (isLoading)
    return (
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 text-yellow-500 animate-spin' />
            <h3 className='font-semibold text-xl'>
              Loading...
            </h3>
            <p className='text-zinc-500 text-sm'>
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === 'PROCESSING')
    return (
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 text-yellow-500 animate-spin' />
            <h3 className='font-semibold text-xl'>
              Processing PDF...
            </h3>
            <p className='text-zinc-500 text-sm'>
              This won&apos;t take long.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === 'FAILED')
    return (
      <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2'>
        <div className='flex-1 flex justify-center items-center flex-col mb-28'>
          <div className='flex flex-col items-center gap-2'>
            <Frown className='h-8 w-8 text-red-500' />
            <h3 className='font-semibold text-xl'>
              Too many pages in PDF
            </h3>
            <p className='text-zinc-500 text-sm'>
              Wuhu~
            </p>
            <Link href='/dashboard' className={buttonVariants({
              variant: 'secondary',
              className: 'mt-4'
            })}>
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Back
            </Link>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  return (
    <div>
      <div>
        <Message />
      </div>
      <ChatInput isDisabled />
    </div>
  )
}

export default ChatWrapper