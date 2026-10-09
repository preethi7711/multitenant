export function Skeleton({ width, height = 16, className, style }) {
  return (
    <span
      className={`skeleton${className ? ` ${className}` : ''}`}
      style={{ display: 'block', width: width || '100%', height, ...style }}
    />
  )
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '13px 16px' }}>
          <Skeleton height={14} width={i === 0 ? '60%' : '80%'} />
        </td>
      ))}
    </tr>
  )
}
