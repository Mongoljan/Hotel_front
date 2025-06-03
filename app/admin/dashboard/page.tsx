'use client';

import React from 'react';

// Static sample data
const smallCards = [
  {
    title: 'Өнгөрсөн сарын борлуулалт',
    value: '20,000,000',
    description: 'Нийт орлого',
  },
  {
    title: 'Шинэ хэрэглэгчид',
    value: '1,200',
    description: 'Сүүлийн 30 хоног',
  },
  {
    title: 'Үлдэгдэл захиалга',
    value: '340',
    description: 'Баталгаажаагүй',
  },
  {
    title: 'Орлогын өсөлт',
    value: '15%',
    description: 'Өмнөх сараас',
  },
];

const bigCards = [
  {
    title: 'Хэрэглэгчийн тайлан',
    content: 'Сүүлийн 6 сарын хэрэглэгчийн өсөлт болон идэвх.',
  },
  {
    title: 'Захиалгын график',
    content: 'Энэ сарын захиалгын тоо хэмжээ ба хандлага.',
  },
  {
    title: 'Борлуулалтын харьцуулалт',
    content: 'Өнгөрсөн улиралтай харьцуулсан гүйцэтгэл.',
  },
];

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex justify-end space-x-4">
        <select className="border border-gray-300 rounded px-3 py-2">
          <option>Filter Option 1</option>
          <option>Filter Option 2</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add New
        </button>
      </div>

      {/* First Row - 4 Small Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {smallCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg text-left font-semibold">{card.title}</h3>
            <div className="flex">
            <p className="text-gray-600 mt-2 flex ">{card.value}</p>
                  <p className="text-gray-600 mt-2  ">{card.value}</p>
                  </div>
            <p className="text-gray-600 mt-2">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Second Row - 3 Large Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bigCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-8 h-60 flex flex-col justify-center items-center"
          >
            <h2 className="text-xl font-bold">{card.title}</h2>
            <p className="text-gray-500 mt-2 text-center">{card.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
