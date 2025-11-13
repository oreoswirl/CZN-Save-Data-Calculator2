import React, { useState } from "react";

const SCALE = [0, 10, 30, 50, 70];
function clampIndex(n) {
  return Math.min(Math.max(n, 0), SCALE.length - 1);
}

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

  const pointsForRow = (row, indexOfSameTypeBefore = 0) => {
    switch (row.type) {
      case "neutralCard":
        return 20;
      case "monsterCard":
        return 80;
      case "forbiddenCard":
        return 20;
      case "regularEpiphany":
        if (row.isCharacterCard) return 0;
        if (row.subtype === "neutral" || row.subtype === "monster") return 10;
        return 0;
      case "divineEpiphany":
        return 20;
      case "cardRemoval": {
        const idx = clampIndex(indexOfSameTypeBefore);
        const base = SCALE[idx];
        const charBonus = row.isCharacterCard ? 20 : 0;
        return base + charBonus;
      }
      case "duplication": {
        const idx = clampIndex(indexOfSameTypeBefore);
        return SCALE[idx];
      }
      case "conversion": {
        return 10;
      }
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-white">CZN Save Data Calculator</h1>
        <p className="text-sm text-yellow-300 mb-6 bg-[#1e2533] p-3 rounded-lg border border-yellow-500">
          💡 <strong>TIP:</strong> If you convert a character's card before removing it, you save 10 points. <br />
          Example: Removing 3 basic cards from a single character costs <strong>20 + 30 + 50 = 100</strong> points, but converting them to neutral cards and then removing them only costs <strong>(10×3) + 0 + 10 + 30 = 70</strong> points.
        </p>

        <div className="bg-[#141a26] border border-[#1f2937] rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Run Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tier</label>
              <input
                type="number"
                min="1"
                value={tier}
                onChange={(e) => setTier(Number(e.target.value))}
                className="bg-[#1e2533] border border-[#2d3748] rounded-md p-2 w-full text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Determines base point limit per character run.</p>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">Nightmare Mode</label>
              <input
                type="checkbox"
                checked={nightmare}
                onChange={(e) => setNightmare(e.target.checked)}
                className="accent-blue-500 scale-125"
              />
              <p className="text-xs text-gray-400">(+1 Tier) Adds +1 Tier to your base point limit when enabled.</p>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">Codex Modifier</label>
              <select
                value={codex}
                onChange={(e) => setCodex(Number(e.target.value))}
                className="bg-[#1e2533] border border-[#2d3748] rounded-md p-2 w-full text-white"
              >
                <option value="0">None</option>
                <option value="1">+1 Tier</option>
                <option value="2">+2 Tiers</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">💡 Codex modifiers increase effective Tier, raising your point limit.</p>
            </div>
          </div>
        </div>

        {characters.map((char) => {
          let totalPoints = 0;
          for (let i = 0; i < char.rows.length; i++) {
            const row = char.rows[i];
            const idxBefore = char.rows.slice(0, i).filter((r) => r.type === row.type).length;
            totalPoints += pointsForRow(row, idxBefore);
          }

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
                      <th className="px-3 py-2 text-left">Character Card</th>
                      <th className="px-3 py-2 text-left">Notes</th>
                      <th className="px-3 py-2 text-left">Points</th>
                      <th className="px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1b2230]">
                    {char.rows.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-gray-500">
                          No data. Add actions to begin.
                        </td>
                      </tr>
                    ) : (
                      char.rows.map((row, i) => {
                        const idxBefore = char.rows.slice(0, i).filter((r) => r.type === row.type).length;
                        return (
                          <tr key={row.id} className="hover:bg-[#222b3d]">
                            <td className="px-3 py-2">
                              <select
                                value={row.type}
                                onChange={(e) => updateRow(char.id, row.id, { type: e.target.value, subtype: "" })}
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
                              {row.type === "cardRemoval" ? (
                                <select
                                  value={row.subtype}
                                  onChange={(e) => updateRow(char.id, row.id, { subtype: e.target.value })}
                                  className="bg-[#1e2533] border border-[#2d3748] rounded-md p-1 text-white w-full"
                                >
                                  {row.isCharacterCard ? (
                                    <>
                                      <option value="starter">Starter Card</option>
                                      <option value="divineEpiphany">Divine Epiphany</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="starter">Starter Card</option>
                                      <option value="commonCard">Common Card</option>
                                      <option value="neutralCard">Neutral Card</option>
                                      <option value="monsterCard">Monster Card</option>
                                      <option value="divineEpiphany">Divine Epiphany</option>
                                      <option value="regularEpiphany">Regular Epiphany</option>
                                    </>
                                  )}
                                </select>
                              ) : row.type === "regularEpiphany" ? (
                                <select
                                  value={row.subtype}
                                  onChange={(e) => updateRow(char.id, row.id, { subtype: e.target.value })}
                                  className="bg-[#1e2533] border border-[#2d3748] rounded-md p-1 text-white w-full"
                                >
                                  {row.isCharacterCard ? (
                                    <>
                                      <option value="starter">Starter/Epiphany Card</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="neutral">Neutral Card</option>
                                      <option value="monster">Monster Card</option>
                                    </>
                                  )}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={row.subtype}
                                  onChange={(e) => updateRow(char.id, row.id, { subtype: e.target.value })}
                                  className="bg-[#1e2533] border border-[#2d3748] rounded-md p-1 text-white w-full"
                                />
                              )}
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

                            <td className="px-3 py-2 text-blue-400 font-semibold">{pointsForRow(row, idxBefore)}</td>

                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => removeRow(char.id, row.id)}
                                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md text-xs text-white"
                              >
                                X
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#1e2533] p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Faint Memory Points</p>
                  <p className="text-2xl font-bold text-white">{totalPoints}</p>
                </div>
                <div className={`${overCap ? "bg-red-800 border-red-600" : "bg-green-700 border-green-600"} p-4 rounded-lg text-center border`}>
                  <p className="text-xs text-gray-100">Point Limit</p>
                  <p className="text-2xl font-bold text-white">{limit}</p>
                  <p className="text-xs text-gray-200">{overCap ? "Over the cap!" : "Within cap"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
