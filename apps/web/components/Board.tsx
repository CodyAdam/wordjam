'use client';

export default function Board(props: {}) {
  const col = 40;
  const row = 40;


  return (
    <div className='grid' style={
      {
        gridTemplateColumns: `repeat(${col}, 1fr)`,
        gridTemplateRows: `repeat(${row}, 1fr)`,
      }
    }>
      {Array.from(Array(col).keys()).map((row, index1) => {
        return Array.from(Array(row).keys()).map((col, index2) => {
          return <div className='border border-black h-5 w-5' key={index1 + '-' + index2}></div>;
        });
      })}
    </div>
  );
}
