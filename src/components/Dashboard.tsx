"use client"

import { trpc } from "@/app/_trpc/client"
import UploadButton from "./UploadButton"
import { Ghost, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useState } from "react";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import Image from 'next/image'
import { Angry } from 'lucide-react';

interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const Dashboard = ({ subscriptionPlan }: PageProps) => {
  const utils = trpc.useUtils();

  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null);

  const { data: files, isLoading } = trpc.getUserFiles.useQuery();
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate();
    },
    onMutate: ({ id }) => {
      setCurrentlyDeletingFile(id);
    },
    onSettled: () => {
      setCurrentlyDeletingFile(null);
    }
  });

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="font-bold mb-3 text-5xl text-gray-900">My Files</h1>
        <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
      </div>

      {/* check if there are files, if not, check if loading, if not, show no files */}
      {files && files.length > 0 ? (
        <ul className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'>
                <Link
                  href={`/dashboard/${file.id}`}
                  className='flex flex-col gap-2'>
                  <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                    <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-yellow-300 to-red-400' />
                    <div className='flex-1 truncate'>
                      <div className='flex items-center space-x-3'>
                        <h3 className='truncate text-lg font-medium text-zinc-900'>
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className='px-4 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                  <div className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    {format(
                      new Date(file.createdAt),
                      'dd MMM yyyy'
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' />
                    Mocked
                  </div>

                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    size='sm'
                    className='w-full'
                    variant='destructive'>
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton className="my-2" height={100} count={3} />
      ) : (
        <div className="flex flex-col items-center gap-2 mt-16">
          <Ghost className="h-8 w-8 text-orange-300" />
          <h3 className="text-xl font-semibold">Oops, so empty</h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
    </main>
  )
}

export default Dashboard