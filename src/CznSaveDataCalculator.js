import React, { useState } from "react";

export default function CznSaveDataCalculator() {
  const [tier, setTier] = useState(1);
  const [nightmare, setNightmare] = useState(false);
  const [codex, setCodex] = useState(0);

  const baseLimit = (tier, nightmare, codex) => {
    const effectiveTier = tier + (nightmare ? 1 : 0) + codex;
    return 30 + 10 * (effectiveTier - 1);
  };

  const [characters, setCharacters] = useState([
    { id: 1, name: "Character 1", rows: [] },
    { id: 2, name: "Character 2", rows: [] },
    { id: 3, name: "Character 3", rows: [] },
  ]);

  const addRow = (charId) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === charId
          ? {
              ...c,
              rows: [
                ...c.rows,
                {
                  id: Date.now(),
                  type: "neutralCard",
                  subtype: "",
                  count: 1,
                  isCharacterCard: false,
                  notes: "",
                },
              ],
            }
          : c
      )
    );
  };

  const updateRow = (charId, rowId, patch) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === charId
          ? { ...c, rows: c.rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)) }
          : c
      )
    );
  };

  const removeRow = (charId, rowId) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === charId ? { ...c, rows: c.rows.filter((r) => r.id !== rowId) } : c
      )
    );
  };

  // ✅ FIXED FORMULA: first removal/duplication/conversion per character is free
  const pointsForRow = (row, charRows) => {
    switch (row.type) {
      case "neutralCard":
        return 20 * row.count;
      case "monsterCard":
        return 80 * row.count;
      case "forbiddenCard":
        return 20 * row.count;
      case "regularEpiphany":
        return 10 * row.count;
      case "divineEpiphany":
        return 20 * row.count;
      case "cardRemoval":
      case "duplication":
      case "conversion": {
        const sameTypeRows = charRows.filter((r) => r.type === row.type);
        const firstRow = sameTypeRows[0];
        // If this is the first of its type, it's free
        if (firstRow && firstRow.id === row.id) return 0;
        return 10 * row.count;
      }
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">CZN Save Data Calculator</h1>

        {/* Run Setup */}
        <div className="bg-[#141a26] border border-[#1f2937] rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Run Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Run Tier</label>
              <input
                type="number"
                min={1}
                value={tier}
                onChange={(e) => setTier(parseInt(e.target.value) || 1)}
                className="w-full p-2 rounded-md bg-[#1e2533] text-white border border-[#2d3748] focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Determines base point limit per character run.</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Nightmare Mode</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={nightmare}
                  onChange={(e) => setNightmare(e.target.checked)}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-sm">(+1 Tier)</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Adds +1 Tier to your base point limit when enabled.</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Codex Modifier</label>
              <select
                value={codex}
                onChange={(e) => setCodex(parseInt(e.target.value))}
                className="w-full p-2 rounded-md bg-[#1e2533] text-white border border-[#2d3748] focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={0}>None</option>
                <option value={1}>+1 Tier</option>
                <option value={2}>+2 Tiers</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Codex modifiers increase run Tier (+1 or +2).</p>
            </div>
          </div>
        </div>

        {/* Character Tables */}
        {characters.map((char) => {
          const totalPoints = char.rows.reduce(
            (acc, r) => acc + pointsForRow(r, char.rows),
            0
          );
          const limit = baseLimit(tier, nightmare, codex);
          const overCap = totalPoints > limit;

          return (
            <div key={char.id} className="bg-[#141a26] border border-[#1f2937] rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">{char.name} Actions</h2>
                <button
                  onClick={() => addRow(char.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Add Row
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full text-sm text-gray-200">
                  <thead className="bg-[#1e2533] text-gray-300">
                    <tr>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Subtype</th>
                      <th className="px-3 py-2 text-left">Count</th>
                      <th className="px-3 py-2 text-left">Character Card</th>
                      <th className="px-3 py-2 text-left">Notes</th>
                      <th className="px-3 py-2 text-left">Points</th>
                      <th className="px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1b2230]">
                    {char.rows.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-6 text-gray-500">
                          No data. Add actions to begin.
                        </td>
                      </tr>
                    ) : (
                      char.rows.map((row) => (
                        <tr key={row.id} className="hover:bg-[#222b3d]">
                          <td className="px-3 py-2">
                            <select
                              value={row.type}
                              onChange={(e) => updateRow(char.id, row.id, { type: e.target.value })}
                              className="bg-[#1e2533] border border-[#2d3748] rounded-md p-1 text-white w-full"
                            >
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
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.subtype}
                              onChange={(e) => updateRow(char.id, row.id, { subtype: e.target.value })}
                              className="bg-[#1e2533] border border-[#2d3748] rounded-md p-1 text-white w-full"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={row.count}
                              min={1}
                              onChange={(e) =>
                                updateRow(char.id, row.id, {
                                  count: parseInt(e.target.value) || 1,
                                })
                              }
                              className="bg-[#1e2533] border border-[#2d3748] rounded-md p-1 text-white w-full"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={row.isCharacterCard}
                              onChange={(e) => updateRow(char.id, row.id, { isCharacterCard: e.target.checked })}
                              className="accent-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.notes}
                              onChange={(e) => updateRow(char.id, row.id, { notes: e.target.value })}
                              className="bg-[#1e2533] border border-[#2d3748] rounded-md p-1 text-white w-full"
                            />
                          </td>
                          <td className="px-3 py-2 text-blue-400 font-semibold">
                            {pointsForRow(row, char.rows)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => removeRow(char.id, row.id)}
                              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md text-xs text-white"
                            >
                              X
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#1e2533] p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Faint Memory Points</p>
                  <p className="text-2xl font-bold text-white">{totalPoints}</p>
                </div>
                <div
                  className={`${
                    overCap ? "bg-red-800 border-red-600" : "bg-green-700 border-green-600"
                  } p-4 rounded-lg text-center border`}
                >
                  <p className="text-xs text-gray-100">Point Limit</p>
                  <p className="text-2xl font-bold text-white">{limit}</p>
                  <p className="text-xs text-gray-200">
                    {overCap ? "Over the cap!" : "Within cap"}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-[#2d3748] pt-4">
                <div className="w-full h-32 bg-[#0f1624] rounded-lg border border-[#2d3748]"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
