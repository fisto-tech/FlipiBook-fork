import React, { useEffect, useState } from 'react';
import ShapeProperties from '../ShapeProperties';
import { getPenDefaults, setPenDefaults } from '../../utils/penDefaults';

/**
 * Shown while the Pen tool is active and nothing is selected: how to draw, plus the
 * stroke / fill used for the next path (the same controls as Shape Properties).
 */
const PenDefaultsPanel = ({ activePageIndex, activeMainTool }) => {
  const [defaults, setDefaults] = useState(getPenDefaults());

  useEffect(() => {
    const onChange = (e) => setDefaults({ ...(e.detail || getPenDefaults()) });
    window.addEventListener('pen-defaults-changed', onChange);
    return () => window.removeEventListener('pen-defaults-changed', onChange);
  }, []);

  // ShapeProperties writes through updateElementAttribute — here it updates the pen defaults
  const updateDefaults = (_page, _id, attrOrUpdates, value) => {
    const updates = typeof attrOrUpdates === 'object' && attrOrUpdates !== null
      ? attrOrUpdates : { [attrOrUpdates]: value };
    const patch = {};
    if ('fill' in updates) patch.fill = updates.fill || 'none';
    if ('stroke' in updates) patch.stroke = updates.stroke || 'none';
    if ('stroke-width' in updates) patch.strokeWidth = String(updates['stroke-width']);
    if ('opacity' in updates) patch.opacity = String(updates.opacity);
    if (Object.keys(patch).length) setPenDefaults(patch);
  };

  const tips = ['Click to add a point', 'Click and drag to make a curve', 'Click the first point to close the shape', 'Press Enter or Esc to finish'];

  return (
    <div className="flex flex-col gap-[1.7vw] w-full">
      <div className="flex flex-col gap-[0.6vw] select-none">
        <div className="flex items-center gap-[0.8vw]">
          <span className="text-[0.9vw] font-semibold text-gray-900 whitespace-nowrap tracking-tight">
            Pen Tool Properties
          </span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>
        <ul className="flex flex-col gap-[0.35vw] text-[0.72vw] text-gray-500">
          {tips.map((t) => (
            <li key={t} className="flex items-center gap-[0.45vw]">
              <span className="w-[0.3vw] h-[0.3vw] rounded-full bg-indigo-400 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
        <span className="text-[0.66vw] text-gray-400">The settings below are used for the next path you draw.</span>
      </div>

      <ShapeProperties
        selectedElementProps={{
          __penDefaults: true,
          tagName: 'path',
          fill: defaults.fill,
          stroke: defaults.stroke,
          strokeWidth: defaults.strokeWidth,
          opacity: defaults.opacity || '1',
        }}
        activePageIndex={activePageIndex}
        selectedLayerId={null}
        updateElementAttribute={updateDefaults}
        activeMainTool={activeMainTool}
      />
    </div>
  );
};

export default PenDefaultsPanel;
