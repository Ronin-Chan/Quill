import Dashboard from '@/components/Dashboard'
import { db } from '@/db'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'

const Page = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

  // const dbUser = await db.user.findFirst({
  //   where: {
  //     id: user.id
  //   }
  // })

  // mock
  const dbUser = {
    id: "exampleUserId",
    email: "user@example.com",
    stripeCustomerId: "cus_QSXrRclKSc0fec",
    stripeSubscriptionId: "sub_1Pbcq2IW8qXYETFQvpYuEn72",
    stripePriceId: "stripe_price_789",
    stripeCurrentPeriodEnd: new Date("2024-12-31T23:59:59Z"),
    File: [],
    Messages: [],
  };

  if(!dbUser) redirect('/auth-callback?origin=dashboard')

  const subscriptionPlan = await getUserSubscriptionPlan()

  return <Dashboard subscriptionPlan={subscriptionPlan} />
}

export default Page