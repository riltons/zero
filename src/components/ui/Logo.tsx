interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 py-2 ${className}`}>
      <div className="relative w-10 h-10">
        {/* Círculo de fundo */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: '#213435' }}
        />
        
        {/* Efeito de movimento */}
        <div 
          className="absolute inset-1 rounded-full opacity-50"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, #46685b 0%, transparent 60%)'
          }}
        />
        
        {/* Peça principal */}
        <div className="absolute inset-2 flex">
          {/* Metade esquerda */}
          <div 
            className="w-1/2 h-full relative rounded-l-sm bg-white transform origin-right hover:rotate-45 transition-transform"
            style={{ border: '1px solid #46685b' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#46685b' }}
              />
            </div>
          </div>
          
          {/* Metade direita */}
          <div 
            className="w-1/2 h-full relative rounded-r-sm bg-white transform origin-left hover:-rotate-45 transition-transform"
            style={{ border: '1px solid #46685b' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#46685b' }}
              />
            </div>
          </div>
        </div>
        
        {/* Efeito de brilho */}
        <div 
          className="absolute top-0 right-0 w-2 h-2 rounded-full opacity-75"
          style={{ 
            background: 'radial-gradient(circle at center, #fff 0%, transparent 70%)'
          }}
        />
      </div>
      <div className="flex flex-col">
        <span 
          className="text-lg font-bold tracking-tight leading-none"
          style={{ color: '#213435' }}
        >
          DoMatch
        </span>
        <span 
          className="text-[10px] tracking-wide"
          style={{ color: '#46685b' }}
        >
          Dominó Manager
        </span>
      </div>
    </div>
  )
}
