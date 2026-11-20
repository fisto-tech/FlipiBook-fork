const fs = require('fs');
const filePath = 'd:/Sham/FlipiBook/Frontend/src/components/Analytics/FlipbookDetailAnalytics.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add datePickerRef
if (!content.includes('const datePickerRef = useRef(null);')) {
  content = content.replace(
    'const sidebarSortRef = useRef(null);',
    'const sidebarSortRef = useRef(null);\n  const datePickerRef = useRef(null);'
  );
}

// 2. Update the Controls section to stack labels and wire up datePickerRef and Custom click
const targetSection = `            {/* Controls */}
            <div className="bg-white rounded-[0.65vw] p-[0.75vw] px-[1vw] border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-[1vw]">
              {/* Left Side: Date Range label + Date Picker + Preset Buttons */}
              <div className="flex items-center gap-[0.9vw] flex-wrap">
                <span className="text-[0.85vw] text-black font-normal whitespace-nowrap">
                  Date Range
                </span>

                <AnalyticsDatePicker
                  className="w-[15.5vw] min-w-[210px]"
                  startDate={customRange.startDate}
                  endDate={customRange.endDate}
                  onChange={(range) => {
                    setCustomRange(range);
                    setDetailDatePreset('Custom');
                  }}
                />

                <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
                  {['Today', 'Yesterday', '7 Days', '30 Days', 'Custom'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        setDetailDatePreset(preset);
                        const end = new Date();
                        const start = new Date();
                        if (preset === 'Today') {
                          // start is today
                        } else if (preset === 'Yesterday') {
                          start.setDate(end.getDate() - 1);
                          end.setDate(end.getDate() - 1);
                        } else if (preset === '7 Days') {
                          start.setDate(end.getDate() - 6);
                        } else if (preset === '30 Days') {
                          start.setDate(end.getDate() - 29);
                        }
                        setCustomRange({ startDate: start, endDate: end });
                      }}
                      className={\`px-[1.05vw] py-[0.38vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer whitespace-nowrap \${
                        detailDatePreset === preset
                          ? 'bg-[#EC5137] text-white shadow-xs'
                          : 'text-[#555555] hover:text-slate-900 hover:bg-slate-50'
                      }\`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: Group By label on the left side of the three buttons */}
              <div className="flex items-center gap-[0.8vw] shrink-0">
                <span className="text-[0.85vw] text-black font-normal whitespace-nowrap">
                  Group By
                </span>

                <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
                  {['Date', 'Week', 'Month'].map(grp => (
                    <button
                      key={grp}
                      onClick={() => setDetailGroupBy(grp)}
                      className={\`px-[1.25vw] py-[0.38vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer whitespace-nowrap \${
                        detailGroupBy === grp
                          ? 'bg-[#EC5137] text-white shadow-xs'
                          : 'text-[#555555] hover:text-slate-900 hover:bg-slate-50'
                      }\`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>
            </div>`;

const newSection = `            {/* Controls */}
            <div className="bg-white rounded-[0.65vw] p-[0.85vw] px-[1vw] border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-end justify-between gap-[1vw]">
              {/* Left Side: Date Range label stacked on top */}
              <div className="flex flex-col gap-[0.35vw]">
                <span className="text-[0.74vw] text-slate-700 font-medium whitespace-nowrap">
                  Date Range
                </span>
                <div className="flex items-center gap-[0.75vw] flex-wrap">
                  <AnalyticsDatePicker
                    ref={datePickerRef}
                    className="w-[15.5vw] min-w-[210px]"
                    startDate={customRange.startDate}
                    endDate={customRange.endDate}
                    onChange={(range) => {
                      setCustomRange(range);
                      setDetailDatePreset('Custom');
                    }}
                  />

                  <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
                    {['Today', 'Yesterday', '7 Days', '30 Days', 'Custom'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          setDetailDatePreset(preset);
                          if (preset === 'Custom') {
                            if (datePickerRef.current) {
                              datePickerRef.current.open();
                            }
                            return;
                          }
                          const end = new Date();
                          const start = new Date();
                          if (preset === 'Today') {
                            // start is today
                          } else if (preset === 'Yesterday') {
                            start.setDate(end.getDate() - 1);
                            end.setDate(end.getDate() - 1);
                          } else if (preset === '7 Days') {
                            start.setDate(end.getDate() - 6);
                          } else if (preset === '30 Days') {
                            start.setDate(end.getDate() - 29);
                          }
                          setCustomRange({ startDate: start, endDate: end });
                        }}
                        className={\`px-[1.05vw] py-[0.38vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer whitespace-nowrap \${
                          detailDatePreset === preset
                            ? 'bg-[#EC5137] text-white shadow-xs'
                            : 'text-[#555555] hover:text-slate-900 hover:bg-slate-50'
                        }\`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Group By label stacked on top */}
              <div className="flex flex-col gap-[0.35vw] shrink-0">
                <span className="text-[0.74vw] text-slate-700 font-medium whitespace-nowrap">
                  Group By
                </span>

                <div className="inline-flex items-center bg-white border border-slate-200 rounded-[0.45vw] p-[0.2vw] gap-[0.25vw]">
                  {['Date', 'Week', 'Month'].map(grp => (
                    <button
                      key={grp}
                      onClick={() => setDetailGroupBy(grp)}
                      className={\`px-[1.25vw] py-[0.38vw] rounded-[0.35vw] text-[0.72vw] font-medium transition-colors cursor-pointer whitespace-nowrap \${
                        detailGroupBy === grp
                          ? 'bg-[#EC5137] text-white shadow-xs'
                          : 'text-[#555555] hover:text-slate-900 hover:bg-slate-50'
                      }\`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>
            </div>`;

if (!content.includes(targetSection)) {
  console.log('Error: targetSection not found in FlipbookDetailAnalytics.jsx');
  process.exit(1);
} else {
  content = content.replace(targetSection, newSection);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated FlipbookDetailAnalytics.jsx with datePickerRef and Custom trigger');
}
