import React, { useEffect, useState, useCallback } from "react";
import { AngleClipButton } from "./Button";
import { BACKEND_URL } from "@/lib/constant";
import { RiRefreshFill } from "react-icons/ri";

interface ZoneOption {
  name: string;
  duration: number; // in seconds
  availableDuration: number; // in seconds
  id: string;
  players: string[];
  maxPlayers: number;
  playersInRoom: number;
  gameStarted: boolean;
}

interface RoomPopupProps {
  handleStartGame: (isTeamMode: boolean, isCreator: boolean) => void;
  handleCloseStartPopup: () => void;
  soldierName: string;
  walletAddress: string;
  zoneCode: string;
  setZoneCode: (code: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  mode: "solo" | "team";
  setMode: (mode: "solo" | "team") => void;
  setSoldierName: (name: string) => void;
}

const RoomPopup: React.FC<RoomPopupProps> = ({
  handleCloseStartPopup,
  soldierName,
  zoneCode,
  walletAddress,
  setZoneCode,
  setDuration,
  mode,
  setSoldierName,
}) => {
  const [zoneOptions, setZoneOptions] = useState<ZoneOption[]>([]);
  const [remainingTimes, setRemainingTimes] = useState<Record<string, number>>(
    {}
  );
  const [teamAction, setTeamAction] = useState<"create" | "join" | null>(null);
  const [customZoneName, setCustomZoneName] = useState("");
  const [customDuration, setCustomDuration] = useState(180);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [joinZoneId, setJoinZoneId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Memoized fetch function to prevent unnecessary recreations
  const fetchRooms = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/rooms/available`);
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }
      const data = await response.json();

      const rooms = data.map((room: any) => ({
        name: room.roomId,
        duration: room.Duration,
        availableDuration: room.AvailableDuration,
        id: room.roomId,
        players: [], // You might need to fetch this separately
        maxPlayers: room.totalPlayers,
        playersInRoom: room.playersInRoom,
        gameStarted: room.gameStarted,
      }));

      setZoneOptions(rooms);

      // Initialize remaining times
      const initialTimes: Record<string, number> = {};
      rooms.forEach((room: ZoneOption) => {
        initialTimes[room.id] = room.gameStarted
          ? room.availableDuration
          : room.duration;
      });
      setRemainingTimes(initialTimes);

      // Auto-select the first available room if none is selected
      if (rooms.length > 0 && !zoneCode) {
        setZoneCode(rooms[0].id);
        setDuration(rooms[0].duration.toString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  }, [setZoneCode, setDuration, zoneCode]);

  useEffect(() => {
    // Initial fetch
    fetchRooms();

    // Set up polling interval (e.g., every 10 seconds)
    // const pollingInterval = setInterval(fetchRooms, 10000);

    // return () => {
    //   clearInterval(pollingInterval);
    // };
  }, [fetchRooms]);

  useEffect(() => {
    // Timer for countdown - only runs when zoneOptions changes
    const timer = setInterval(() => {
      setRemainingTimes((prevTimes) => {
        const newTimes: Record<string, number> = {};
        let shouldUpdate = false;

        zoneOptions.forEach((zone) => {
          if (zone.gameStarted && prevTimes[zone.id] > 0) {
            newTimes[zone.id] = prevTimes[zone.id] - 1;
            shouldUpdate = true;
          } else {
            newTimes[zone.id] = prevTimes[zone.id] || zone.duration;
          }
        });

        return shouldUpdate ? newTimes : prevTimes;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [zoneOptions]);

  // Handle zone selection changes
  useEffect(() => {
    if (zoneCode) {
      const selectedZone = zoneOptions.find((zone) => zone.id === zoneCode);
      if (selectedZone) {
        setDuration(selectedZone.duration.toString());
      }
    }
  }, [zoneCode, zoneOptions, setDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const shouldShowZone = (zone: ZoneOption) => {
    if (!zone.gameStarted) return true;
    const remainingTime = remainingTimes[zone.id] || 0;
    return remainingTime > zone.duration * 0.3;
  };

  const filteredZoneOptions = zoneOptions.filter(shouldShowZone);

  const handleCreateZone = async () => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }

      const response = await fetch(`${BACKEND_URL}/api/rooms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: customZoneName, // Using customZoneName as roomId
          Duration: customDuration,
          maxMembers: maxPlayers,
          creator: walletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }
      if (response.ok) {
        alert(" Room Created Successfully");
      }

      const newZone: ZoneOption = {
        name: customZoneName,
        duration: customDuration,
        availableDuration: customDuration,
        id: data.roomId,
        players: [soldierName],
        maxPlayers: maxPlayers,
        gameStarted: false,
      };

      setZoneOptions((prev) => [...prev, newZone]);
      setZoneCode(data.roomId);
      setDuration(customDuration.toString());
      setTeamAction(null);

      // Start the game in team mode as creator
      // handleJoinZone();
    } catch (err) {
      console.error("Error creating room:", err);
      setError(err instanceof Error ? err.message : "Failed to create room");
    }
  };

  const handleJoinZone = async () => {
    try {
      // alert("Joining room...: " + joinZoneId);
      if (!joinZoneId) {
        alert("Please select a zone first");
      }
      if (!walletAddress) {
        throw new Error("Wallet address is required to join a room");
      }
      const response = await fetch(`${BACKEND_URL}/api/room/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: joinZoneId, // Use the selected zoneCode instead of joinZoneId
          walletAddress: walletAddress,
        }),
      });

      const result = await response.json();
      console.log("Join room response:", result);

      if (!response.ok) {
        const errorMessage =
          result.message ||
          result.error ||
          response.statusText ||
          "Failed to join room";
        console.error("Failed to join room:", errorMessage, result);
        setError(errorMessage);
        return;
      }

      if (response.ok) {
        alert("Joined in room Successfully");
      }

      setZoneCode(result.roomId);
      // handleStartGame(true, false);
    } catch (err) {
      console.error("Error joining room:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to server"
      );
    }
  };

  const renderSoloMode = () => (
    <>
      <div>
        <label className="block text-lg font-semibold">Soldier Name:</label>
        <input
          type="text"
          placeholder="Enter name"
          className="w-full mt-2 px-3 py-2 text-white text-base border border-gray-300"
          value={soldierName}
          onChange={(e) => setSoldierName(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="w-full mt-2 px-3 py-2 text-white">
            <div className="flex justify-between ">
              {" "}
              <label className="block mb-2 text-base font-medium">
                Select Zone
              </label>
              <button
                onClick={fetchRooms}
                disabled={loading}
                className="flex items-center text-cyan-400 hover:text-cyan-300 text-sm disabled:text-gray-500"
              >
                <RiRefreshFill className="w-7 h-7" />
              </button>
            </div>
            {loading ? (
              <div className="text-center py-4">Loading rooms...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <div
                className="space-y-4 h-64 overflow-y-auto "
                style={{
                  backgroundBlendMode: "overlay",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {filteredZoneOptions.map((zone) => {
                  const isSelected = joinZoneId === zone.name;
                  const isFull = zone.playersInRoom >= zone.maxPlayers;
                  const isDisabled = isFull;

                  return (
                    <label
                      key={zone.id}
                      className={`flex items-center justify-between w-full px-3 py-2 border rounded cursor-pointer space-x-2 transition-colors
        ${
          isSelected
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-300 hover:bg-gray-700"
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
                    >
                      <input
                        type="radio"
                        name="zone"
                        value={zone.name}
                        disabled={isDisabled}
                        checked={isSelected}
                        onChange={() => setJoinZoneId(zone.name)}
                        className="form-radio text-blue-500"
                      />
                      <div className="flex flex-col">
                        <span>{zone.name}</span>
                        <span className="text-xs text-gray-400">
                          {zone.gameStarted
                            ? "Game in progress"
                            : "Waiting to start"}
                        </span>
                        <span className="text-sm text-gray-400">
                          ({zone.playersInRoom}/{zone.maxPlayers} players)
                        </span>
                      </div>
                      <div className="text-sm text-cyan-400 ml-auto">
                        {formatTime(remainingTimes[zone.id] || 0)}
                      </div>
                    </label>
                  );
                })}

                {filteredZoneOptions.length === 0 && (
                  <div className="text-sm italic text-gray-200">
                    No rooms available. Try creating your own.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <div>
          <AngleClipButton
            text="Home"
            onClick={handleCloseStartPopup}
            className="w-48"
          />
        </div>

        <div>
          <AngleClipButton
            disabled={!soldierName || soldierName.length < 4 || !zoneCode}
            text="Join Room"
            onClick={() => handleJoinZone()}
            className="w-48"
          />
        </div>
      </div>
    </>
  );

  const renderTeamMode = () => {
    if (teamAction === "create") {
      return (
        <>
          <div>
            <label className="block text-lg font-semibold">Zone Name:</label>
            <input
              type="text"
              placeholder="Enter team name"
              className="w-full mt-2 px-3 py-2 text-white text-base border border-gray-300"
              value={customZoneName}
              onChange={(e) => setCustomZoneName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-lg font-semibold">
              Duration (minutes):
            </label>
            <input
              type="number"
              min="1"
              max="60"
              step="1"
              value={customDuration / 60}
              onChange={(e) => setCustomDuration(parseInt(e.target.value) * 60)}
              className="w-full mt-2 px-3 py-2 text-white text-base border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold">Max Players:</label>
            <input
              type="number"
              min="2"
              max="8"
              step="1"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full mt-2 px-3 py-2 text-white text-base border border-gray-300"
            />
          </div>

          <div className="flex justify-between pt-6">
            <div>
              <AngleClipButton
                text="Back"
                onClick={() => setTeamAction(null)}
                className="w-48"
              />
            </div>

            <div>
              <AngleClipButton
                text="Create Zone"
                onClick={handleCreateZone}
                className="w-48"
                disabled={!customZoneName}
              />
            </div>
          </div>
        </>
      );
    } else if (teamAction === "join") {
      return (
        <>
          <div>
            <label className="block text-lg font-semibold">Zone ID:</label>
            <input
              type="text"
              placeholder="Enter zone ID"
              className="w-full mt-2 px-3 py-2 text-white text-base border border-gray-300"
              value={joinZoneId}
              onChange={(e) => setJoinZoneId(e.target.value)}
            />
          </div>

          <div className="flex justify-between pt-6">
            <div>
              <AngleClipButton
                text="Back"
                onClick={() => setTeamAction(null)}
                className="w-48"
              />
            </div>

            <div>
              <AngleClipButton
                text="Join Zone"
                onClick={handleJoinZone}
                className="w-48"
                disabled={!joinZoneId}
              />
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div>
            <label className="block text-lg font-semibold">Soldier Name:</label>
            <input
              type="text"
              placeholder="Enter name"
              className="w-full mt-2 px-3 py-2 text-white text-base border border-gray-300"
              value={soldierName}
              onChange={(e) => setSoldierName(e.target.value)}
            />
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <AngleClipButton
              disabled={!soldierName || soldierName.length < 4}
              text="Create Zone"
              onClick={() => setTeamAction("create")}
              className="w-48"
            />
            <AngleClipButton
              disabled={!soldierName || soldierName.length < 4}
              text="Join Zone"
              onClick={() => setTeamAction("join")}
              className="w-48"
            />
          </div>

          <div className="flex justify-center pt-6">
            <AngleClipButton
              text="Home"
              onClick={handleCloseStartPopup}
              className="w-48"
            />
          </div>
        </>
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black opacity-80 z-50">
      <div className="relative w-full max-w-lg ">
        {/* Border layer with clip path */}
        <div
          className="absolute inset-0 bg-cyan-500"
          style={{
            clipPath:
              "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)",
          }}
        />

        {/* Content layer with slightly smaller clip path and inset */}
        <div
          className="relative m-0.5 bg-black bg-opacity-60 backdrop-filter backdrop-blur-md p-8 text-white"
          style={{
            clipPath:
              "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)",
          }}
        >
          <div className="space-y-6 text-base">
            <h2 className="text-2xl font-bold text-center">
              {mode === "solo" ? "Solo" : "Team"}
            </h2>

            {mode === "solo" ? renderSoloMode() : renderTeamMode()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPopup;
