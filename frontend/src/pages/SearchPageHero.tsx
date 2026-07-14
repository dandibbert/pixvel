interface SearchPageHeroProps {
  title: string
  subtitle: string
}

export default function SearchPageHero({ title, subtitle }: SearchPageHeroProps) {
  return (
    <div className="bg-white md:bg-primary pt-5 pb-3 md:pt-20 md:pb-32 px-4 mb-0 md:mb-[-4rem]">
      <div className="max-w-7xl mx-auto text-left">
        <h1 className="text-2xl md:text-6xl font-bold text-foreground md:text-white mb-1 md:mb-2 tracking-tight">{title}</h1>
        <p className="text-foreground/55 md:text-white/80 text-sm md:text-xl font-medium max-w-2xl mb-0">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
