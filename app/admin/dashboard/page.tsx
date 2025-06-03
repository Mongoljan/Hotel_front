'use client';

import React from 'react';
import { GrMoney } from "react-icons/gr";
import { BsClipboard2Data } from "react-icons/bs";
import { MdOutlineBedroomChild, MdPendingActions } from "react-icons/md";
import {
  PieChart, Pie, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  LineChart, Line
} from 'recharts';

const smallCards = [
  {
    title: 'Өнгөрсөн сарын борлуулалт',
    value: '20,000,000',
    icon: <GrMoney />,
    description: 'Нийт орлого',
  },
  {
    title: 'Захиалгууд',
    value: '150(32 гадаад)',
    icon: <BsClipboard2Data />,
    description: 'Нийт захиалгын тоо',
  },
  {
    title: 'Өрөөний тоо',
    value: '500',
    icon: <MdOutlineBedroomChild />,
    description: 'Сайтаар зарагдсан өрөөний тоо',
  },
  {
    title: 'Хүлээгдэж буй ',
    value: "8'000'000T",
    icon: <MdPendingActions />,
    description: 'Хүлээгдэж буй орлого',
  },
];

const bigCards = [
  {
    title: 'Борлуулалтаар',
    content: 'Сүүлийн 6 сарын хэрэглэгчийн өсөлт болон идэвх.',
  },
  {
    title: 'Өрөөний төрлөөр',
    content: 'Энэ сарын захиалгын тоо хэмжээ ба хандлага.',
  },
  {
    title: 'Байрласан хоногоор',
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
          <div key={index} className="bg-white rounded-[10px] border-border border-solid border-[1px] p-6 text-center">
            <h3 className="text-[18px] text-left font-semibold">{card.title}</h3>
            <div className="flex mt-5 justify-between">
              <p className="text-black text-xl font-semibold">{card.value}</p>
              <p className="text-gray-600 text-3xl">{card.icon}</p>
            </div>
            <p className="text-soft text-left mt-5">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Second Row - 3 Large Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bigCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-[10px] border-border border-solid border-[1px] p-8 h-60 flex flex-col"
          >
            <h2 className="text-xl text-left font-bold">{card.title}</h2>
            <p className="text-gray-500 mt-2 text-center">{card.content}</p>
          </div>
        ))}
      </div> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-[10px] border border-border p-4">
          <h3 className="text-lg font-semibold mb-4">Борлуулалтаар</h3>
          <PieChart width={250} height={250}>
            <Pie
              dataKey="value"
              isAnimationActive={false}
              data={[
                { name: 'Дотоод', value: 118 },
                { name: 'Гадаад', value: 32 },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            />
            <Tooltip />
          </PieChart>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-[10px] border border-border p-4">
          <h3 className="text-lg font-semibold mb-4">Өрөөний төрлүүдээр</h3>
          <BarChart width={300} height={250} data={[
            { name: 'Стандарт', uv: 60 },
            { name: 'Делюкс', uv: 90 },
            { name: 'Сьют', uv: 45 },
          ]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="uv" fill="#82ca9d" />
          </BarChart>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-[10px] border border-border p-4">
          <h3 className="text-lg font-semibold mb-4">Байрласан хоногоор</h3>
          <LineChart width={300} height={250} data={[
            { name: '1-р сар', value: 3000000 },
            { name: '2-р сар', value: 4000000 },
            { name: '3-р сар', value: 5000000 },
            { name: '4-р сар', value: 3500000 },
            { name: '5-р сар', value: 6000000 },
            { name: '6-р сар', value: 7000000 },
          ]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>
    </div>
  );
}
