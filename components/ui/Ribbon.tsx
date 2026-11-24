export function Ribbon({ className = '', height = 6 }: { className?: string; height?: number }) {
  return <div aria-hidden="true" className={`bg-ribbon ${className}`} style={{ height }} />;
}
