"use client"

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react';
import { useToast } from './ui/use-toast';

import { useResizeDetector } from 'react-resize-detector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger } from './ui/dropdown-menu';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const PDFRenderer = ({ url }: { url: string }) => {
  const { toast } = useToast()

  const { width, ref } = useResizeDetector()

  const [numPages, setNumPages] = useState<number>()
  const [currentPage, setCurrentPage] = useState<number>(1)

  const pageValidator = z.object({
    page: z.string().refine((num) => Number(num) > 0 && Number(num) <= numPages!)
  })

  type TPageValidator = z.infer<typeof pageValidator>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<TPageValidator>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(pageValidator)
  })

  const handlePageSubmit = ({ page }: TPageValidator) => {
    setCurrentPage(Number(page))
    setValue('page', String(page)) // input value is string
  }

  return (
    <div className='flex flex-col w-full bg-white rounded-md items-center shadow'>
      <div className='flex items-center justify-between h-14 w-full border-b border-zinc-200 px-2'>
        <div className='flex items-center gap-1.5'>
          <Button aria-label='previous page' variant='ghost'
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))
              setValue('page', String(currentPage - 1))
            }}>
            <ChevronDown className='w-4 h-4' />
          </Button>
          <div className='flex items-center gap-1.5'>
            <Input
              className={cn('w-12 h-8 focus-visible:ring-yellow-500', errors.page && "focus-visible:ring-red-400")}
              {...register('page')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(handlePageSubmit)()
                }
              }} />
            <p className='text-zinc-700 text-sm space-x-1'>
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button aria-label='next page' variant='ghost'
            disabled={currentPage === numPages || numPages === undefined}
            onClick={() => {
              setCurrentPage((prev) => (prev + 1 > numPages! ? numPages! : prev + 1))
              setValue('page', String(currentPage + 1))
            }}>
            <ChevronUp className='w-4 h-4' />
          </Button>
        </div>

        <div className='space-x-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label='zoom' variant='ghost'>
                  <Search className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
        </div>
      </div>
      <div className='flex-1 w-full max-h-screen'>
        <div ref={ref}>
          <Document
            className='max-w-full'
            file={url}
            loading={
              <div>
                <Loader2 className='my-24 h-6 w-6 animate-spin' />
              </div>
            }
            onLoadSuccess={(numPages) => setNumPages(numPages.numPages)}
            onLoadError={() => {
              toast({
                title: 'Error loading PDF',
                description: 'Please try again later',
                variant: 'destructive'
              })
            }
            }>
            <Page width={width ? width : 1} pageNumber={currentPage} />
          </Document>
        </div>
      </div>
    </div >
  )
}

export default PDFRenderer