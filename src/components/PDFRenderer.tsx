"use client"

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, RotateCw, ScanSearch } from 'lucide-react';
import { useToast } from './ui/use-toast';

import { useResizeDetector } from 'react-resize-detector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

import SimpleBar from 'simplebar-react';
import PDFFullscreen from './PDFFullscreen';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const PDFRenderer = ({ url }: { url: string }) => {
  const { toast } = useToast()

  const { width, ref } = useResizeDetector()

  const [numPages, setNumPages] = useState<number>()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [renderedScale, setRenderedScale] = useState<number | null>(null)

  const isLoading = renderedScale !== scale

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
            <ChevronLeft className='w-4 h-4' />
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
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>

        <div className='space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label='zoom' variant='ghost' className='gap-1.5'>
                <ScanSearch className='w-4 h-4' />
                {scale * 100}%<ChevronDown className='h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            aria-label='rotate 90 degrees'
            variant='ghost'
            onClick={() => setRotation((prev) => prev + 90)}>
            <RotateCw className='w-4 h-4' />
          </Button>

          <PDFFullscreen fileUrl={url} />
        </div>
      </div>
      <div className='flex-1 w-full max-h-screen'>
        <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
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
              }}>
              {/* show old page, when new page is not ready */}
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  key={"@" + renderedScale}
                />
              ) : null}

              {/* regular page */}
              <Page
                className={cn(isLoading ? 'hidden' : '')}
                width={width ? width : 1}
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className='flex justify-center'>
                    <Loader2 className='my-24 h-6 w-6 animate-spin' />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div >
  )
}

export default PDFRenderer