interface ImpulsaCreditProps {
  variant?: 'light' | 'compact';
}

export default function ImpulsaCredit({ variant = 'light' }: ImpulsaCreditProps) {
  if (variant === 'compact') {
    return (
      <a
        href="https://www.instagram.com/impulsa.soft.ar"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-2 py-2 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <img src="/impulsa/logo-impulsa.jpeg" alt="Impulsa" className="w-6 h-6 rounded-full" />
        <span className="text-xs">Hecho por Impulsa</span>
      </a>
    );
  }

  return (
    <a
      href="https://www.instagram.com/impulsa.soft.ar"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      <img src="/impulsa/logo-impulsa.jpeg" alt="Impulsa" className="w-10 h-10 rounded-full" />
      <span className="text-xs font-medium">Hecho por Impulsa</span>
      <span className="text-xs">@impulsa.soft.ar · 261 525-3814</span>
    </a>
  );
}
