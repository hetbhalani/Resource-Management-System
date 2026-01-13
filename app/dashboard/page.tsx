import React from 'react'

function DashboardPage() {
  return (
    <>
      <div className='grid grid-cols-5 grid-rows-9 gap-3 row-span-12 h-screen'>
          <div className="bg-red-500 row-span-1">1</div>
          <div className="bg-orange-500 col-span-4 row-span-1">2</div>
          <div className="bg-lime-500 row-span-8">3</div>
          <div className="bg-emerald-500 row-span-8 col-span-4 ">4</div>
       
      </div>
    </>
  )
}

export default DashboardPage