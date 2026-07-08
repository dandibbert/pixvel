interface SearchPageHeroProps {
  title: string
  subtitle: string
}

export default function SearchPageHero({ title, subtitle }: SearchPageHeroProps) {
  return (
    <div className="bg-primary pt-12 pb-16 md:pt-20 md:pb-32 px-4 mb-[-2.5rem] md:mb-[-4rem]">
      <div className="max-w-7xl mx-auto text-center md:text-left">
        <h1 className="text-2xl md:text-6xl font-bold text-white mb-2 tracking-tight">{title}</h1>
        <p className="text-white/80 text-sm md:text-xl font-medium max-w-2xl mx-auto md:mx-0">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
