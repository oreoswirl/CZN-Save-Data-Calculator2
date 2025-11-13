import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Moon, Sun, ChevronDown, ChevronRight } from "lucide-react";

const SCALE = [0, 10, 30, 50, 70];
function clampIndex(n) {
  return Math.min(Math.max(n, 0), SCALE.length - 1);
}

function CharacterTable({ name, darkMode, tier, nightmare, codexAdd }) {
  const [rows, setRows] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  function basePointLimit(x) {
    return 30 + 10 * (x - 1);
  }

  function effectiveTier() {
    return Number(tier) + (nightmare ? 1 : 0) + Number(codexAdd);
  }

  function addRow() {
    setRows((r) => [
      ...r,
      { id: Date.now() + Math.random(), type: "neutralCard", subtype: "", count: 1, isCharacterCard: false, info: "" },
    ]);
  }

  function updateRow(id, patch) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id) {
    setRows((r) => r.filter((row) => row.id !== id));
  }

  function pointsForRow(row, indexOfSameTypeBefore = 0) {
    const cnt = Number(row.count) || 0;
    let total = 0;
    for (let i = 0; i < cnt; i++) {
      switch (row.type) {
        case "neutralCard": total += 20; break;
        case "monsterCard": total += 80; break;
        case "forbiddenCard": total += 20; break;
        case "regularEpiphany": total += (row.subtype === "starting" || row.subtype === "unique") ? 0 : 10; break;
        case "divineEpiphany": total += 20; break;
        case "cardRemoval": {
          const idx = clampIndex(indexOfSameTypeBefore);
          total += SCALE[idx];
          if (row.isCharacterCard) total += 20;
          break;
        }
        case "duplication": {
          const idx = clampIndex(indexOfSameTypeBefore);
          total += SCALE[idx];
          break;
        }
        case "conversion": {
          const idx = clampIndex(indexOfSameTypeBefore);
          total += (idx === 0 ? 10 : SCALE[idx]);
          break;
        }
        default: total += 0;
      }
    }
    return total;
  }

  function computeTotals() {
    const ordered = rows;
    let faintMemoryPoints = 0;
    const counters = { cardRemoval: 0, duplication: 0, conversion: 0 };

    for (const row of ordered) {
      let idxBefore = counters[row.type] || 0;
      const pts = pointsForRow(row, idxBefore);
      faintMemoryPoints += pts;
      if (counters[row.type] !== undefined) counters[row.type] += Number(row.count) || 0;
    }

    const limit = basePointLimit(effectiveTier());
    const over = faintMemoryPoints > limit;
    return { faintMemoryPoints, limit, over };
  }

  const { faintMemoryPoints, limit, over } = computeTotals();
  const chartData = rows.map((row) => ({ name: row.type, value: pointsForRow(row, 0) }));

  return (
    <Card className={`shadow-xl ${darkMode ? 'bg-gray-900 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-300'} mt-6`}>
      <CardHeader>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            {collapsed ? <ChevronRight /> : <ChevronDown />} {name} Actions / Acquisitions
          </CardTitle>
          <div className="text-sm text-gray-400">{collapsed ? 'Click to expand' : 'Click to collapse'}</div>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <Button onClick={addRow} className="mb-4 bg-blue-600 hover:bg-blue-500 text-white">Add Row</Button>

          <div className="overflow-x-auto">
            <table className={`w-full text-sm rounded-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900 border border-gray-200'}`}>
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Subtype</th>
                  <th className="p-2 text-left">Count</th>
                  <th className="p-2 text-left">Character Card</th>
                  <th className="p-2 text-left">Notes</th>
                  <th className="p-2 text-left">Points</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-3 text-center text-gray-500">No actions yet.</td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={row.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`}>
                    <td className="p-2">
                      <select value={row.type} onChange={(e) => updateRow(row.id, { type: e.target.value })} className={`w-full border rounded p-1 ${darkMode ? 'bg-gray-700 text-gray-100 border-gray-500' : 'bg-white text-gray-900 border-gray-300'}`}>
                        <option value="neutralCard">Neutral Card</option>
                        <option value="monsterCard">Monster Card</option>
                        <option value="forbiddenCard">Forbidden Card</option>
                        <option value="regularEpiphany">Regular Epiphany</option>
                        <option value="divineEpiphany">Divine Epiphany</option>
                        <option value="cardRemoval">Card Removal</option>
                        <option value="duplication">Card Duplication</option>
                        <option value="conversion">Card Conversion</option>
                      </select>
                    </td>
                    <td className="p-2"><input type="text" value={row.subtype} onChange={(e) => updateRow(row.id, { subtype: e.target.value })} className={`w-full border rounded p-1 ${darkMode ? 'bg-gray-700 text-gray-100 border-gray-500' : 'bg-white text-gray-900 border-gray-300'}`} /></td>
                    <td className="p-2"><input type="number" value={row.count} min={1} onChange={(e) => updateRow(row.id, { count: Math.max(1, Number(e.target.value) || 1) })} className={`w-full border rounded p-1 ${darkMode ? 'bg-gray-700 text-gray-100 border-gray-500' : 'bg-white text-gray-900 border-gray-300'}`} /></td>
                    <td className="p-2 text-center"><input type="checkbox" checked={row.isCharacterCard || false} onChange={(e) => updateRow(row.id, { isCharacterCard: e.target.checked })} className="accent-blue-500" /></td>
                    <td className="p-2"><input type="text" value={row.info} onChange={(e) => updateRow(row.id, { info: e.target.value })} className={`w-full border rounded p-1 ${darkMode ? 'bg-gray-700 text-gray-100 border-gray-500' : 'bg-white text-gray-900 border-gray-300'}`} /></td>
                    <td className="p-2 font-semibold text-blue-700 dark:text-blue-400">{pointsForRow(row, 0)} pts</td>
                    <td className="p-2 text-center"><Button variant="destructive" onClick={() => removeRow(row.id)} className="bg-red-600 hover:bg-red-500 text-white">X</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <div className="grid md:grid-cols-3 gap-6 mb-4">
              <div className={`${darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-gray-100 border border-gray-400'} p-3 rounded-lg`}>
                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Faint Memory Points</div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{faintMemoryPoints}</div>
              </div>
              <div className={`p-3 border rounded-lg ${over ? (darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-500 text-red-900') : (darkMode ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-100 border-green-500 text-green-900')}`}>
                <div className="text-sm font-semibold">Point Limit</div>
                <div className="text-2xl font-bold">{limit}</div>
                <div className="text-xs mt-1 opacity-80">{over ? 'Over the cap!' : 'Within cap'}</div>
              </div>
            </div>

            <Progress value={(faintMemoryPoints / limit) * 100} className="h-3 mb-4 bg-gray-300 dark:bg-gray-700" />

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke={darkMode ? '#ddd' : '#111'} />
                  <YAxis stroke={darkMode ? '#ddd' : '#111'} />
                  <Tooltip wrapperStyle={{ backgroundColor: darkMode ? '#222' : '#f9fafb', color: darkMode ? '#fff' : '#111' }} />
                  <Bar dataKey="value" fill={darkMode ? '#60a5fa' : '#2563eb'} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function CZNSaveDataCalculator() {
  const [tier, setTier] = useState(1);
  const [nightmare, setNightmare] = useState(false);
  const [codexAdd, setCodexAdd] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gradient-to-br from-white to-slate-100 text-gray-900'} min-h-screen p-8 transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">CZN Save Data — Multi-Character Calculator</h1>
          <Button onClick={() => setDarkMode(!darkMode)} variant="outline" className="flex items-center gap-2 bg-transparent border-gray-400 text-sm hover:bg-gray-200 dark:hover:bg-gray-800">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>

        <Card className={`shadow-xl ${darkMode ? 'bg-gray-900 text-gray-100 border border-gray-700' : 'bg-white border border-gray-300'}`}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Run Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Run Tier</label>
                <input type="number" value={tier} onChange={(e) => setTier(Number(e.target.value) || 1)} className={`w-full border rounded p-2 mt-1 ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`} />
              </div>
              <div>
                <label className="text-sm font-medium">Nightmare Mode</label>
                <div className="flex items-center mt-2">
                  <input type="checkbox" checked={nightmare} onChange={(e) => setNightmare(e.target.checked)} className="mr-2 accent-blue-500" />
                  <span className="text-sm">(+1 Tier)</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Codex Modifier</label>
                <select value={codexAdd} onChange={(e) => setCodexAdd(Number(e.target.value))} className={`w-full border rounded p-2 mt-1 ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}>
                  <option value={0}>None</option>
                  <option value={1}>+1 Tier</option>
                  <option value={2}>+2 Tiers</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {["Character 1", "Character 2", "Character 3"].map((c) => (
          <CharacterTable key={c} name={c} darkMode={darkMode} tier={tier} nightmare={nightmare} codexAdd={codexAdd} />
        ))}
      </div>
    </div>
  );
}
