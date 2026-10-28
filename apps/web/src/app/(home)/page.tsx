import { Workbench } from "@/components/home/workbench"
import BlurText from "@/components/reactbits/blur-text"

const headlineMotion = { animateBy: "words", trigger: "load", delay: 90, stepDuration: 0.3, blur: 8, distance: 14 } as const

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 pt-12 pb-24 sm:px-6 sm:pt-20">
      <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
        <BlurText text="Simple tools." {...headlineMotion} />
        <BlurText text="Powerful possibilities." {...headlineMotion} className="text-muted-foreground" />
      </h1>
      <Workbench />
    </main>
  )
}
