import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Chart = ({ data }) => {
  return (
    <div className='h-[22rem] bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1'>
      <strong className='text-gray-700 font-medium'>Priority Task</strong>
      <div className='mt-3 w-full flex-1 text-xs'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray='3 3 0 0' vertical={false} />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='value' fill='#0ea5e9' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
