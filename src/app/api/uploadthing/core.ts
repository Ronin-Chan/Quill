import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

const f = createUploadthing();

const middleware = async () => {
  // This code runs on your server before upload
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  // If you throw, the user will not be able to upload
  if (!user || !user.id) throw new Error("Unauthorized");

  const subscriptionPlan = await getUserSubscriptionPlan()

  // Whatever is returned here is accessible in onUploadComplete as `metadata`
  return { subscriptionPlan, userId: user.id };
}

const onUploadComplete = async ({
  metadata, file
}: {
  metadata: Awaited<ReturnType<typeof middleware>>,
  file: {
    key: string,
    name: string,
    url: string
  }
}) => {
  // This code RUNS ON YOUR SERVER after upload

  // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key
    },
  })

  if (isFileExist) {
    return
  }

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: file.url,
      uploadStatus: 'PROCESSING'
    }
  })

  try {
    const response = await fetch(file.url);
    const blob = await response.blob();

    const loader = new PDFLoader(blob);

    const pageLevelDocs = await loader.load();

    const pagesAmt = pageLevelDocs.length;

    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;

    const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === 'Pro')!.pagesPerPdf;

    const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === 'Free')!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        where: {
          id: createdFile.id
        },
        data: {
          uploadStatus: 'FAILED',
        }
      })
    }

    const pineconeIndex = pinecone.Index("quill")

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
    })

    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex,
      namespace: createdFile.id,
    })

    await db.file.update({
      where: {
        id: createdFile.id
      },
      data: {
        uploadStatus: 'SUCCESS',
      }
    })
  } catch (error) {
    console.error(error)
    await db.file.update({
      where: {
        id: createdFile.id
      },
      data: {
        uploadStatus: 'FAILED',
      }
    })
  }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;