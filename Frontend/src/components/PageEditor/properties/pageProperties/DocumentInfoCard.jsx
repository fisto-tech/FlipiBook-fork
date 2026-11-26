import React from 'react';

const DocumentInfoCard = ({ info }) => {
  return (
    <div className="flex flex-col gap-[0.8vw]">
      <div className="flex items-center gap-[0.8vw]">
        <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap">Document info</span>
        <div className="flex-1 h-[1px] bg-gray-200" />
      </div>
      <div className="bg-white rounded-[0.5vw] border border-gray-200 p-[0.9vw] shadow-2xs flex flex-col gap-[0.7vw]">
        <div className="flex justify-between items-center text-[0.8vw]">
          <span className="text-gray-500 font-medium">Format</span>
          <span className="text-gray-900 font-semibold">{info.format}</span>
        </div>
        <div className="flex justify-between items-center text-[0.8vw]">
          <span className="text-gray-500 font-medium">Orientation</span>
          <span className="text-gray-900 font-semibold">{info.orientation}</span>
        </div>
        <div className="flex justify-between items-center text-[0.8vw]">
          <span className="text-gray-500 font-medium">Dimensions</span>
          <span className="text-gray-900 font-semibold">{info.dimensions}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentInfoCard;
