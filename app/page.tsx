"use client";
import { useEffect, useState } from "react";
import Char1 from "../public/images/character/character_1.png";
import Char2 from "../public/images/character/character_2.png";
import Map1 from "../public/images/map/map1.png";
import Map2 from "../public/images/map/map2.png";
import ArrowLeft from "./assets/arrowleft.svg";
import ArrowRight from "./assets/arrowright.svg";
import PlayerStatus from "./assets/player-status.svg";
import Star from "./assets/star.svg";
import Coin from "./assets/coin.svg";
import BtnTemp from "./assets/btn-template.svg";
import Shop from "./assets/shop.svg";
import Rank from "./assets/rank.svg";
import Gear from "./assets/gear.svg";
import PlayTypeSelecter from "./assets/play-type/play-btn-select.svg";
import PlayTypeSelecterBG from "./assets/play-type/bg.svg";
import Solo from "./assets/play-type/solo-play.svg";
import PlayTypeDeSelecter from "./assets/play-type/play-btn-unselected.svg";
import Team from "./assets/play-type/team-up.svg";
import Playbtn from "./assets/play-btn.svg";
import Close from "./assets/button-cancel.svg";
// Adding placeholder item images
import ak47 from "../public/images/items/ak47.jpg";
import mp40 from "../public/images/items/mp40.png";
import mp5 from "../public/images/items/mp5.jpg";
import p90 from "../public/images/items/p90.jpg";
import ItemGrenade from "../public/images/items/grenade.jpg";
// import ItemCharacter from '../public/images/character/character_1.png';
import ItemGold from "../public/images/items/Tokens.jpg";
import LeaderboardPopup from "./components/LeaderboardPopup";


import Image from "next/image";
import { CustomWallet } from "./components/Wallet";
import GameIframe from "./components/GameIframe";
import {
  getStakingTokenBalance,
  getTokenSymbol,
} from "@/contract/integration/integration";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { BACKEND_URL, getStoredWalletAddress } from "@/lib/constant";

import { FaHistory } from "react-icons/fa";
import RoomJoin from "./components/RoomJoin";


// Add interface for Popup props
// interface PopupProps {
//   title: string;
//   onClose: () => void;
//   children: ReactNode;
// }

interface UserData {
  _id: string;
  walletAddress: string;
  __v: number;
  isStaked: boolean;
  kills: number;
  score: number;
  username: string;
}



export interface UserInfo {
  walletAddress: string;
  username: string;
}

export interface RoomHistory {
  roomId: string;
  users: UserInfo[];
}

export default function Home() {
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [selectedMap, setSelectedMap] = useState(0);
  const [showShopPopup, setShowShopPopup] = useState(false);
  const [showStartPopup, setShowStartPopup] = useState(false);
  const [showLeaderPopup, setShowLeaderPopup] = useState(false);


  const [shopCategory, setShopCategory] =
    useState<keyof typeof shopItems>("Guns");
  const [selectedMode, setSelectedMode] = useState<"solo" | "team" | null>(
    "solo"
  );
  const [showGameFrame, setShowGameFrame] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState("");

  // const [playerName, setPlayerName] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roomId, setRoomId] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenSymbol, setTokenSymbol] = useState("AST");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [mounted, setMounted] = useState(false);



  const [fetchedUserData, setFetchedUserData] = useState<UserData | null>(null);

  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [historyData, setHistoryData] = useState<RoomHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneCode, setZoneCode] = useState(null);
  const [duration, setDuration] = useState("1 Min");
  // const [stakingFromRoomJoin, setStakingFromRoomJoin] = useState(false);

  // Add missing state variables
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");

  // Helper function to format token balance
  const formatTokenBalance = (balance: string) => {
    const numBalance = parseFloat(balance);
    if (numBalance === 0) return "0.000000";
    if (numBalance < 0.000001) {
      // For very small numbers, show more decimal places instead of scientific notation
      return numBalance.toFixed(18).replace(/\.?0+$/, ''); // Remove trailing zeros
    }
    return numBalance.toFixed(6);
  };

  const characters = [
    {
      name: "Kodama Archer",
      special: "Forest Blend",
      difficulty: 4,
      image: Char1,
    },
    {
      name: "Spirit Walker",
      special: "Ethereal Dash",
      difficulty: 3,
      image: Char2,
    },
    {
      name: "Bathhouse Guardian",
      special: "Steam Burst",
      difficulty: 2,
      image: Char1,
    },
    { name: "Wind Runner", special: "Gale Force", difficulty: 1, image: Char2 },
  ];

  const maps = [
    { name: "Enchanted Forest", difficulty: 1, image: Map1 },
    { name: "Floating Castle", difficulty: 3, image: Map2 },
    { name: "Spirit Bathhouse", difficulty: 4, image: Map1 },
    { name: "Valley of Wind", difficulty: 2, image: Map2 },
  ];

  // Updated shop items with images
  const shopItems = {
    Guns: [
      { name: "AK47", price: 300, image: ak47, type: "Gun" },
      { name: "mp40", price: 450, image: mp40, type: "Gun" },
      { name: "P90", price: 250, image: p90, type: "Gun" },
      { name: "Mp5", price: 200, image: mp5, type: "Gun" },
    ],
    Grenades: [
      { name: "Flash Orb", price: 200, image: ItemGrenade, type: "Grenade" },
      { name: "Spirit Bomb", price: 350, image: ItemGrenade, type: "Grenade" },
      { name: "Smoke Wisp", price: 180, image: ItemGrenade, type: "Grenade" },
      { name: "Frost Sphere", price: 320, image: ItemGrenade, type: "Grenade" },
    ],
    Characters: [
      { name: "Shadow Ninja", price: 500, image: Char1, type: "Character" },
      { name: "Mystic Monk", price: 600, image: Char2, type: "Character" },
      { name: "Sakura Warrior", price: 550, image: Char1, type: "Character" },
      { name: "Kitsune Rogue", price: 650, image: Char2, type: "Character" },
    ],
    // Diamond: [
    //   {
    //     name: "Diamond Pack (500)",
    //     price: 100,
    //     image: ItemDiamond,
    //     type: "Diamond",
    //   },
    //   {
    //     name: "Diamond Pack (1000)",
    //     price: 180,
    //     image: ItemDiamond,
    //     type: "Diamond",
    //   },
    //   {
    //     name: "Diamond Pack (2500)",
    //     price: 400,
    //     image: ItemDiamond,
    //     type: "Diamond",
    //   },
    //   {
    //     name: "Diamond Pack (5000)",
    //     price: 700,
    //     image: ItemDiamond,
    //     type: "Diamond",
    //   },
    // ],
    Gold: [
      { name: "AST Tokens (1000)", price: 100, image: ItemGold, type: "Gold" },
      { name: "AST Tokens (2500)", price: 150, image: ItemGold, type: "Gold" },
      { name: "AST Tokens (5000)", price: 280, image: ItemGold, type: "Gold" },
      { name: "AST Tokens (10000)", price: 500, image: ItemGold, type: "Gold" },
    ],
  };

  const handleNextCharacter = () => {
    setSelectedCharacter((prev) => (prev + 1) % characters.length);
  };

  const handlePreviousCharacter = () => {
    setSelectedCharacter(
      (prev) => (prev - 1 + characters.length) % characters.length
    );
  };

  const handleNextMap = () => {
    setSelectedMap((prev) => (prev + 1) % maps.length);
  };

  const handlePreviousMap = () => {
    setSelectedMap((prev) => (prev - 1 + maps.length) % maps.length);
  };

  const handleStakePopup = () => {
    if (selectedMode === null) {
      alert("Please select a play mode (Solo/Team) before starting.");
      return;
    }
    handleOpenStartPopup();
  };

  const handleOpenStartPopup = () => {
    setShowStartPopup(true);
  };

  const handleCloseStartPopup = () => {
    setShowStartPopup(false);
  };

  const handleCloseGameFrame = () => {
    setShowGameFrame(false);
    setCurrentRoomId("");
  };

  const handleStartGame = (roomId: string) => {
    setCurrentRoomId(roomId);
    setShowGameFrame(true);
  };

  const handlePurchase = async (item: { type: string; name: string; price: number; image: any }) => {
    try {
      setPurchaseLoading(true);
      
      // Debug logging
      console.log('🛒 Starting purchase for:', item);
      console.log('🔗 Backend URL:', BACKEND_URL);
      console.log('👤 Account:', account);
      
      const purchaseData = {
        type: item.type,
        name: item.name,
        price: item.price,
        image: item.image.src || item.image,
        userId: account?.address || 'anonymous'
      };
      
      console.log('📦 Purchase data being sent:', purchaseData);
      
      const response = await fetch(`${BACKEND_URL}/api/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Purchase successful:', responseData);
        alert(`Successfully purchased ${item.name}!`);
      } else {
        const errorData = await response.json();
        console.error('❌ Purchase failed:', errorData);
        alert(`Purchase failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleStaking = async (stakeAmount: number) => {
    setStakeLoading(true);
    const walletAddress = account?.address;
    try {
      // Note: stakeTokens function is not imported, so we'll comment this out for now
      // const result = await stakeTokens({ amount: stakeAmount });
      // console.log("Staking successful:", result);
      // const hash = result?.hash;
      // if (hash) {
      //   setTransactionHash(hash);
      //   console.log("Transaction Hash:", hash);
      // }
      
      const historyRes = await fetch(`${BACKEND_URL}/api/stake/history/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          amount: stakeAmount,
        }),
      });

      if (historyRes.ok) {
        console.log("Staking history added successfully");
      } else {
        console.error("Failed to add staking history");
      }
    } catch (error) {
      console.error("Staking error:", error);
    } finally {
      setStakeLoading(false);
    }
  };

  const account = useAccount();
  
  // Check for stored wallet address on component mount
  useEffect(() => {
    const storedAddress = getStoredWalletAddress();
    if (storedAddress && !account.address) {
      console.log('📱 Found stored wallet address:', storedAddress);
      // The wallet address is stored but user might need to reconnect
      // This will be handled by the Wallet component
    }
  }, [account.address]);



  const fetchEStkBalance = async () => {
    if (account?.address) {
      setLoadingBalance(true);
      try {
        const result = await getStakingTokenBalance(account.address);
        console.log("Token balance result:", result);
        setTokenBalance(result || "0.000000");
        
        // Also fetch token symbol
        try {
          const symbol = await getTokenSymbol();
          setTokenSymbol(symbol);
        } catch (symbolError) {
          console.error("Error fetching token symbol:", symbolError);
          setTokenSymbol("-AST"); // fallback
        }
      } catch (error) {
        console.error("Error fetching token balance:", error);
        setTokenBalance("0");
      } finally {
        setLoadingBalance(false);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (account?.address) {
      fetchEStkBalance();
    } else {
      setTokenBalance("0.000000");
      setTokenSymbol("AST");
      setLoadingBalance(false);
    }
  }, [account?.address]);







  const handleCloseHistoryPopup = () => {
    setShowHistoryPopup(false);
  };

  useEffect(() => {
    if (showHistoryPopup) {
      setLoading(true);
      fetch(`${BACKEND_URL}/api/user/rooms-played/${account?.address}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched history data:", data); // See the actual data
          if (Array.isArray(data)) {
            setHistoryData(data);
          } else {
            console.error("Invalid data format, expected array:", data);
            setHistoryData([]); // fallback to empty array
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching history:", err);
          setLoading(false);
        });
    }
  }, [showHistoryPopup]);

  return (
    <div
      className="min-h-screen font-Ghibli bg-[url('/images/bgimageFlight.jpeg')] bg-cover bg-center text-white font-sans flex flex-col relative overflow-x-hidden overflow-y-auto"
      style={{ fontFamily: "GamePaused" }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-yellow-700 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="flex justify-between items-center p-6 mx-10 relative z-10">
        <h1 className="text-3xl font-bold text-yellow-400 drop-shadow-lg">
          NOVASTRIKE
        </h1>
        <div className="flex gap-6 items-center">
          <div>
            <div className="flex items-center gap-2">
              <Image
                src={Coin}
                alt="Coin"
                width={30}
                height={30}
                className="text-yellow-400"
              />
              <span className="text-yellow-400 text-xl font-bold">
                {loadingBalance ? "Loading..." : `${formatTokenBalance(tokenBalance)} ${tokenSymbol}`}
              </span>
              {mounted && account?.address && (
                <button
                  onClick={fetchEStkBalance}
                  disabled={loadingBalance}
                  className="ml-2 text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
                  title="Refresh balance"
                >
                  🔄
                </button>
              )}

            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center -mt-1 hover:cursor-pointer hover:scale-105 transition duration-300">
            <Image
              src={BtnTemp}
              alt="Button Template"
              width={60}
              height={60}
              className="align-middle"
            />
            <div
              className="absolute flex flex-col items-center justify-center"
              onClick={() => setShowShopPopup(true)}
            >
              <Image
                src={Shop}
                alt="Shop Icon"
                width={30}
                height={30}
                className="align-middle"
              />
              <span className="text-yellow-400 font-bold text-xs text-center relative bottom-2 mt-2">
                SHOP
              </span>
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center -mt-1 hover:cursor-pointer hover:scale-105 transition duration-300">
            <Image
              src={BtnTemp}
              alt="Button Template"
              width={60}
              height={60}
              className="align-middle"
            />
            <div
              className="absolute flex flex-col items-center justify-center"
              onClick={() => setShowLeaderPopup(true)}
            >
              <Image
                src={Rank}
                alt="Rank Icon"
                width={35}
                height={35}
                className="align-middle"
              />
              <span className="text-yellow-400 font-bold text-xs text-center relative bottom-2 mt-2">
                RANK
              </span>
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center -mt-1 hover:cursor-pointer hover:scale-105 transition duration-300">
            <Image
              src={BtnTemp}
              alt="Button Template"
              width={60}
              height={60}
              className="align-middle"
            />
            <div className="absolute flex flex-col items-center justify-center">
              <Image
                src={Gear}
                alt="Gear Icon"
                width={30}
                height={30}
                className="align-middle"
              />
              <span className="text-yellow-400 font-bold text-xs text-center relative bottom-2 mt-2">
                GEAR
              </span>
            </div>
          </div>
          <div
            className="relative flex flex-col items-center justify-center -mt-1 hover:cursor-pointer hover:scale-105 transition duration-300"
            onClick={() => setShowHistoryPopup(true)}
          >
            <Image
              src={BtnTemp}
              alt="Button Template"
              width={60}
              height={60}
              className="align-middle"
            />
            <div className="absolute flex flex-col items-center justify-center">
              <FaHistory className="text-2xl text-white" />
              <span className="text-yellow-400 font-bold text-xs text-center relative bottom-2 mt-2">
                HISTORY
              </span>
            </div>
          </div>

          <div className="relative z-50">
            {mounted && (
              <CustomWallet
                setFetchedUserData={setFetchedUserData}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-1 top-0 relative z-10">
        {/* Character and Map Section */}
        <div className="flex flex-col md:flex-row flex-1 gap-8">
          {/* Left Side - Character */}
          <div className="relative w-1/2 bottom-20 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
              {/* Status */}
              <div className="relative w-80 h-20 top-12 right-10 z-50">
                <p className="relative top-6 left-12 text-base font-bold">
                  {fetchedUserData ? "ONLINE" : "OFFLINE"}
                </p>
                <Image
                  src={PlayerStatus}
                  alt="Player Status"
                  className="mb-4"
                />
              </div>

              {/* Username */}
              <p className="relative top-6 right-36 text-black text-base font-bold z-50">
                @{fetchedUserData ? fetchedUserData?.username : "john doe"}
              </p>

              {/* Character Container */}
              <div className="relative w-80 h-[500px] cursor-pointer">
                {/* Left Arrow */}
                <Image
                  src={ArrowLeft}
                  alt="Arrow Left"
                  onClick={handlePreviousCharacter}
                  className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 z-50 transition duration-300 hover:scale-110"
                />

                {/* Character Image */}
                <div className="relative w-full h-full transform hover:scale-105 transition duration-300">
                  <Image
                    src={characters[selectedCharacter].image}
                    alt="Character"
                    className="rounded-lg"
                    layout="fill"
                    objectFit="cover"
                  />

                  {/* Coming Soon Overlay */}
                  {selectedCharacter !== 0 && selectedCharacter <= 3 && (
                    <div className="absolute inset-0 bg-black opacity-80 flex items-center justify-center z-30 rounded-lg">
                      <p className="text-white text-3xl font-bold">
                        Coming Soon
                      </p>
                    </div>
                  )}
                </div>

                {/* Show info only if selectedCharacter === 0 */}
                {selectedCharacter === 0 && (
                  <>
                    <div className="flex justify-center gap-1 mt-2 z-20">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                          key={index}
                          src={Star}
                          alt="star"
                          className={
                            index < characters[selectedCharacter].difficulty
                              ? "opacity-100"
                              : "opacity-30"
                          }
                          width={20}
                          height={20}
                        />
                      ))}
                    </div>
                    <h2 className="text-2xl font-bold text-yellow-400 mb-1 text-center z-20">
                      {characters[selectedCharacter].name} | Lv.{" "}
                      {characters[selectedCharacter].difficulty}
                    </h2>
                    <h2 className="text-xl font-bold text-yellow-400 text-center z-20">
                      Specialist: {characters[selectedCharacter].special}
                    </h2>
                  </>
                )}

                {/* Right Arrow */}
                <Image
                  src={ArrowRight}
                  alt="Arrow Right"
                  onClick={handleNextCharacter}
                  className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 z-50 transition duration-300 hover:scale-110"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="w-1/2 flex flex-col items-end pr-12">
            {/* Map Section */}
            <div className="w-full max-w-md">
              <div className="relative h-80 overflow-hidden rounded-t-lg cursor-pointer w-full border border-[#FDBD1F]">
                {/* Map Image */}
                <Image
                  src={maps[selectedMap].image}
                  alt={maps[selectedMap].name}
                  className="w-full h-full object-cover"
                />

                {/* Transparent Gradient Overlay for Coming Soon */}
                {selectedMap !== 0 && selectedMap <= 3 && (
                  <div className="absolute inset-0 bg-black opacity-80 flex items-center justify-center z-20">
                    <p className="text-white text-3xl font-bold">Coming Soon</p>
                  </div>
                )}

                {/* Gradient Overlay (for normal display and bottom fade effect) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>

                {/* Map Info - only show if not coming soon */}
                {selectedMap === 0 && (
                  <div className="absolute bottom-4 left-0 right-0 px-3 text-center z-20">
                    <div className="flex justify-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                          key={index}
                          src={Star}
                          alt="star"
                          className={
                            index < maps[selectedMap].difficulty
                              ? "opacity-100"
                              : "opacity-30"
                          }
                          width={20}
                          height={20}
                        />
                      ))}
                    </div>
                    <p className="font-bold text-xl text-yellow-400">
                      {maps[selectedMap].name}
                    </p>
                  </div>
                )}

                {/* Left Arrow */}
                <Image
                  src={ArrowLeft}
                  alt="Arrow Left"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviousMap();
                  }}
                  className="absolute left-4 bottom-5 z-30 transition duration-300 hover:scale-110 cursor-pointer"
                />

                {/* Right Arrow */}
                <Image
                  src={ArrowRight}
                  alt="Arrow Right"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextMap();
                  }}
                  className="absolute right-4 bottom-5 z-30 transition duration-300 hover:scale-110 cursor-pointer"
                />
              </div>

              {/* Yellow Bar Below */}
              <div className="h-6 w-full bg-[#FDBD1F] rounded-b-lg -mt-1"></div>
              {/* Play Mode Selection */}
              <div className="flex space-x-4 justify-center items-center mt-4">
                {/* SOLO CARD */}
                <div className="flex justify-center items-center mt-4">
                  <div onClick={() => setSelectedMode("solo")}>
                    <div
                      className={`hover:cursor-pointer transform transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center relative`}
                    >
                      {/* Background image behind the main image */}
                      {selectedMode === "solo" && (
                        <Image
                          src={PlayTypeSelecterBG}
                          alt="Background"
                          className="absolute z-0"
                          height={200}
                          width={200}
                        />
                      )}

                      {/* Main image */}
                      <Image
                        src={
                          selectedMode === "solo"
                            ? PlayTypeSelecter
                            : PlayTypeDeSelecter
                        }
                        alt="Solo Play Type"
                        height={100}
                        width={100}
                        className="relative z-10"
                      />

                      {/* Icon and text overlay */}
                      <div className="relative bottom-[54px] flex flex-col items-center z-20">
                        <Image
                          src={Solo}
                          alt="Solo Icon"
                          height={20}
                          width={20}
                        />
                        <h2 className="text-lg mt-1 font-bold text-yellow-400 relative bottom-2">
                          SOLO
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TEAM CARD */}
                <div className="flex justify-center items-center mt-4">
                  <div onClick={() => setSelectedMode("team")}>
                    <div
                      className={`hover:cursor-pointer transform transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center relative`}
                    >
                      {/* Background image behind the main image */}
                      {selectedMode === "team" && (
                        <Image
                          src={PlayTypeSelecterBG}
                          alt="Background"
                          className="absolute z-0"
                          height={200}
                          width={200}
                        />
                      )}

                      {/* Main image */}
                      <Image
                        src={
                          selectedMode === "team"
                            ? PlayTypeSelecter
                            : PlayTypeDeSelecter
                        }
                        alt="Solo Play Type"
                        height={100}
                        width={100}
                        className="relative z-10"
                      />

                      {/* Icon and text overlay */}
                      <div className="relative bottom-[54px] flex flex-col items-center z-20">
                        <Image
                          src={Team}
                          alt="Team Icon"
                          height={33}
                          width={33}
                        />
                        <h2 className="text-lg mt-1 font-bold text-yellow-400 relative bottom-2">
                          TEAM
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom-right button container with increased spacing */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-6 items-end w-auto z-20">
          <div
            className="hover:cursor-pointer hover:scale-105 transition duration-300"
            onClick={handleStakePopup}
          >
            <Image src={Playbtn} alt="Play Button" className="w-full h-full" />
            <p className="relative text-3xl bottom-16 text-center font-bold">
              START
            </p>
          </div>
        </div>
      </main>



      {showHistoryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black opacity-90 z-40"></div>

          {/* Modal Window */}
          <div className="relative z-50 bg-[#343B50] border-2 border-white rounded-2xl max-w-2xl w-full max-h-[90vh]">
            {/* Close Button */}
            <button
              className="absolute top-1 -right-3 hover:cursor-pointer"
              onClick={handleCloseHistoryPopup}
            >
              <Image src={Close} alt="Close" width={60} height={60} />
            </button>

            {/* Header */}
            <h2
              className="text-2xl font-bold text-white my-3 text-center"
              style={{
                textShadow:
                  "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
              }}
            >
              GAME HISTORY
            </h2>
            <hr className="w-full border-t-2" />

            {/* Content */}
            <div className="p-8 flex flex-col gap-6">
              {loading ? (
                <p className="text-white text-lg text-center">Loading...</p>
              ) : historyData.length === 0 ? (
                <p className="text-white text-lg text-center">
                  No history found.
                </p>
              ) : (
                historyData.map((room, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-700 p-4 rounded-lg border border-white text-white"
                  >
                    <p className="font-bold text-lg mb-2">
                      Room ID: {room.roomId}
                    </p>
                    <div className="grid gap-2">
                      {room.users.map((user, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-gray-800 p-2 rounded"
                        >
                          <span className="font-medium">{user.username}</span>
                          <span className="text-yellow-300 text-sm truncate max-w-[180px]">
                            {user.walletAddress}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    
      


      {showStartPopup && (
        <RoomJoin
          handleCloseStartPopup={handleCloseStartPopup}
          soldierName={fetchedUserData?.username || ""}
          walletAddress={account?.address || ""}
          zoneCode={zoneCode}
          setZoneCode={setZoneCode}
          duration={duration}
          setDuration={setDuration}
          mode={selectedMode}
          onGameReady={handleStartGame}
        />
      )}

      {/* Leaderboard Popup */}
      {showLeaderPopup && (
        <LeaderboardPopup
          showLeaderboard={showLeaderPopup}
          setShowLeaderboard={setShowLeaderPopup}
        />
      )}

      {showGameFrame && (
        <GameIframe 
          roomId={currentRoomId}
          onClose={handleCloseGameFrame} 
        />
      )}

      {/* Shop Popup - Updated with Item Images in Grid */}
      {showShopPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black opacity-90 z-40"></div>

          {/* Modal Window */}
          <div className="relative z-50 bg-[#343B50] border-2 border-white rounded-2xl max-w-4xl w-full max-h-[90vh]">
            {/* Close Button */}
            <button
              className="absolute top-1 -right-3 hover:cursor-pointer"
              onClick={() => setShowShopPopup(false)}
            >
              <Image src={Close} alt="Close" width={60} height={60} />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-white my-3 text-center">
              SPIRIT SHOP
            </h2>
            <hr className="w-full border-t-2" />

            {/* Content */}
            <div className="flex p-6">
              {/* Sidebar */}
              <div className="w-48 flex flex-col gap-2 pr-6 border-r-2 border-yellow-400 overflow-y-auto">
                {Object.keys(shopItems).map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setShopCategory(category as keyof typeof shopItems)
                    }
                    className={`text-lg font-bold py-3 px-4 rounded-xl transition hover:cursor-pointer ${
                      shopCategory === category
                        ? "bg-[#FDBD1F] text-white"
                        : "text-white hover:bg-[#FDBD1F] hover:text-white bg-[rgba(255,255,255,0.2)]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Items Display */}
              <div className="flex-1 pl-6 overflow-y-auto pr-2 max-h-[500px]">
                <div className="grid grid-cols-2 gap-4">
                  {shopItems[shopCategory].map((item, index) => (
                    <div key={index} className="bg-[#FDBD1F] rounded-lg p-1">
                      <div className="bg-gray-500 rounded-lg overflow-hidden">
                        <div className="h-40 bg-gray-500 relative">
                          <Image
                            src={item.image}
                            alt={item.name}
                            className={`w-full h-full ${
                              item.type === "Character"
                                ? "object-contain"
                                : "object-cover"
                            }`}
                          />
                        </div>
                        <div className="p-2 bg-[#FDBD1F] flex justify-between items-center">
                          <div>
                            <h3
                              className="text-lg font-bold"
                              style={{
                                textShadow:
                                  "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                              }}
                            >
                              {item.name}
                            </h3>
                            <p
                              className="uppercase text-yellow-400 font-bold text-sm"
                              style={{
                                textShadow:
                                  "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                              }}
                            >
                              UNLOCK NOW
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="relative w-24 h-12 flex-shrink-0">
                              <Image
                                src={Playbtn}
                                alt="play-btn"
                                layout="fill"
                                className="object-contain"
                              />
                              <div className="absolute inset-0 flex space-x-1 items-center justify-center">
                                <Image
                                  src={Coin}
                                  alt="Coin"
                                  width={16}
                                  height={16}
                                />
                                <span className="font-bold text-lg text-black">
                                  {item.price}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePurchase(item)}
                              disabled={purchaseLoading}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                            >
                              {purchaseLoading ? 'Buying...' : 'BUY'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
