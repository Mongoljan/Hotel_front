// RoomList.tsx
"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

import {
  DataGrid,
  GridColDef,
  GridValidRowModel,
  GridToolbar
} from "@mui/x-data-grid";

import {
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { AiOutlineWifi, AiOutlinePlus } from "react-icons/ai";
import { FaCheck, FaEdit, FaTrashAlt } from "react-icons/fa";
import { GiCigarette } from "react-icons/gi";
import { LiaSmokingBanSolid } from "react-icons/lia";
import { IoPerson } from "react-icons/io5";
import { FaChild } from "react-icons/fa6";
import { LuBedSingle, LuBedDouble } from "react-icons/lu";

import RoomModal from "./RoomModal";
import { toast } from "react-toastify";

////////////////////////////////////////////////////////////////////////////////
// 1) AllData: as returned by /api/all-data/
////////////////////////////////////////////////////////////////////////////////
interface LookupItem {
  id: number;
  name_en: string;
  name_mn: string;
}

interface SimpleLookup {
  id: number;
  name: string;
  is_custom: boolean;
}

interface AllData {
  room_types: SimpleLookup[];
  bed_types: SimpleLookup[];
  room_category: SimpleLookup[];

  room_facilities: LookupItem[];
  bathroom_items: LookupItem[];
  free_toiletries: LookupItem[];
  food_and_drink: LookupItem[];
  outdoor_and_view: LookupItem[];
}

////////////////////////////////////////////////////////////////////////////////
// 2) RoomData: as returned by /api/roomsNew/
////////////////////////////////////////////////////////////////////////////////
interface RoomImage {
  id: number;
  image: string;
  description: string;
}

interface RoomData {
  id: number;
  hotel: number;
  room_number: number;
  room_type: number;
  room_category: number;
  room_size: string;
  bed_type: number;
  is_Bathroom: boolean;

  room_Facilities: number[];
  bathroom_Items: number[];
  free_Toiletries: number[];
  food_And_Drink: number[];
  outdoor_And_View: number[];

  adultQty: number;
  childQty: number;

  number_of_rooms: number;
  number_of_rooms_to_sell: number;
  room_Description: string;
  smoking_allowed: boolean;

  images: RoomImage[];
}

////////////////////////////////////////////////////////////////////////////////
// 3) FlattenRow for DataGrid
////////////////////////////////////////////////////////////////////////////////
interface FlattenRow extends GridValidRowModel {
  id: string;
  isGroup: boolean;

  // Column 1: Arrow placeholder
  arrowPlaceholder: string;

  // Column 2: Thumbnails “Зураг”
  images: string[];

  // Column 3: “Өрөөний нэр”
  categoryName?: string;
  typeName?: string;
  sizeGroup?: string;
  hasWifiGroup?: boolean;

  roomNumberLeaf?: string;
  viewDescription?: string;

  // Column 4: “Өрөөний тоо / Зарах тоо”
  roomNumbersStr?: string; // for group only
  leafSize?: string;       // for leaf only

  smokingAllowed?: boolean;
  hasWifi?: boolean;

  // Column 5: “Хүний тоо / Орны тоо”
  groupHasAdult?: boolean;
  groupHasChild?: boolean;
  groupHasSingleBed?: boolean;
  groupHasDoubleBed?: boolean;

  adultQty?: number;
  childQty?: number;
  bedType?: number; // 1 = single, 2 = double

  // Column 6: “Ерөнхий онцлог зүйлс”
  commonFeaturesArr: string[];
  thisRoomExtraFeaturesArr?: string[];

  // Column 7: “Угаалгын өрөөнд:”
  commonBathroomArr: string[];
  thisRoomExtraBathroomArr?: string[];

  // ── New field for leaf rows ─────────────────────────────────────────────────
  leafRoomId?: number; // numeric `RoomData.id` for edit/delete
}

interface RoomListProps {
  isRoomAdded: boolean;
  setIsRoomAdded: (value: boolean) => void;
}

export default function RoomList({
  isRoomAdded,
  setIsRoomAdded
}: RoomListProps) {
  const [rawRooms, setRawRooms] = useState<RoomData[]>([]);
  const [lookup, setLookup] = useState<AllData>({
    room_types: [],
    bed_types: [],
    room_category: [],

    room_facilities: [],
    bathroom_items: [],
    free_toiletries: [],
    food_and_drink: [],
    outdoor_and_view: []
  });
  const [loading, setLoading] = useState(true);

  // Which groups are expanded?
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // ─── Modal state for Create / Edit ─────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  // DataGrid width = 70% of window.innerWidth
  const [tableWidth, setTableWidth] = useState<number>(window.innerWidth * 0.7);

  // Image preview state
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  /////////////////////////////////////////////////////////////////////////////
  // 4) Fetch “/api/all-data/” and “/api/roomsNew/” with caching
  /////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token not found");

        const cachedLookup = localStorage.getItem("roomLookup");
        const cachedRooms = localStorage.getItem("roomData");

        if (cachedLookup && cachedRooms && !isRoomAdded) {
          setLookup(JSON.parse(cachedLookup));
          setRawRooms(JSON.parse(cachedRooms));
          setLoading(false);
          return;
        }

        const [allRes, roomsRes] = await Promise.all([
          fetch("https://dev.kacc.mn/api/all-data/"),
          fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`)
        ]);

        if (!allRes.ok || !roomsRes.ok) throw new Error("Failed to fetch data");

        const allData = (await allRes.json()) as AllData;
        const roomsData = (await roomsRes.json()) as RoomData[];

        setLookup(allData);
        setRawRooms(roomsData);

        localStorage.setItem("roomLookup", JSON.stringify(allData));
        localStorage.setItem("roomData", JSON.stringify(roomsData));
      } catch (err) {
        console.error("RoomList fetch failed:", err);
      } finally {
        setLoading(false);
        if (isRoomAdded) setIsRoomAdded(false);
      }
    }

    fetchData();
  }, [isRoomAdded, setIsRoomAdded]);

  ///////////////////////////////////////////////////////////////////////////
  // 5) Build groupMap and lookup maps (with nullish guards)
  ///////////////////////////////////////////////////////////////////////////
  const {
    groupMap,
    facilitiesMapMn,
    facilitiesMapEn,
    bathroomItemsMap,
    toiletriesMap,
    foodDrinkMap,
    outdoorViewMap,
    bedTypesMap,
    roomTypesMap,
    roomCategoryMap
  } = React.useMemo(() => {
    // 1) Group rooms by “room_type-room_category”
    const group = new Map<
      string,
      {
        type: string;
        category: string;
        rooms: RoomData[];
      }
    >();

    rawRooms.forEach((r) => {
      const key = `${r.room_type}-${r.room_category}`;
      if (!group.has(key)) {
        // Lookup names for type and category using SimpleLookup.name
        const typeObj = (lookup.room_types ?? []).find((t) => t.id === r.room_type) || null;
        const catObj =
          (lookup.room_category ?? []).find((c) => c.id === r.room_category) || null;

        const typeName = typeObj ? typeObj.name : `Type ${r.room_type}`;
        const categoryName = catObj ? catObj.name : `Category ${r.room_category}`;

        group.set(key, { type: typeName, category: categoryName, rooms: [] });
      }
      group.get(key)!.rooms.push(r);
    });

    // 2) Build ID→name_mn / ID→name_en for room_facilities
    const facilitiesMapMn = new Map<number, string>(
      (lookup.room_facilities ?? []).map((f) => [f.id, f.name_mn])
    );
    const facilitiesMapEn = new Map<number, string>(
      (lookup.room_facilities ?? []).map((f) => [f.id, f.name_en])
    );

    // 3) Build ID→name_mn for other lookups
    const bathroomItemsMap = new Map<number, string>(
      (lookup.bathroom_items ?? []).map((b) => [b.id, b.name_mn])
    );
    const toiletriesMap = new Map<number, string>(
      (lookup.free_toiletries ?? []).map((ft) => [ft.id, ft.name_mn])
    );
    const foodDrinkMap = new Map<number, string>(
      (lookup.food_and_drink ?? []).map((fd) => [fd.id, fd.name_mn])
    );
    const outdoorViewMap = new Map<number, string>(
      (lookup.outdoor_and_view ?? []).map((ov) => [ov.id, ov.name_mn])
    );

    // 4) Build ID→name for bed_types (SimpleLookup.name)
    const bedTypesMap = new Map<number, string>(
      (lookup.bed_types ?? []).map((b) => [b.id, b.name])
    );

    // 5) Build ID→name for room_types and room_category as well
    const roomTypesMap = new Map<number, string>(
      (lookup.room_types ?? []).map((t) => [t.id, t.name])
    );
    const roomCategoryMap = new Map<number, string>(
      (lookup.room_category ?? []).map((c) => [c.id, c.name])
    );

    return {
      groupMap: group,
      facilitiesMapMn,
      facilitiesMapEn,
      bathroomItemsMap,
      toiletriesMap,
      foodDrinkMap,
      outdoorViewMap,
      bedTypesMap,
      roomTypesMap,
      roomCategoryMap
    };
  }, [
    rawRooms,
    lookup.room_facilities,
    lookup.bathroom_items,
    lookup.free_toiletries,
    lookup.food_and_drink,
    lookup.outdoor_and_view,
    lookup.bed_types,
    lookup.room_types,
    lookup.room_category
  ]);

  /////////////////////////////////////////////////////////////////////////////
  // 6) Flatten groups + children into rows[], with the desired layout
  /////////////////////////////////////////////////////////////////////////////
  const rows: FlattenRow[] = [];
  groupMap.forEach((grp, key) => {
    // ─── 1) Gather comma-separated room numbers in this group
    const roomNumbersArr = grp.rooms.map((r) => String(r.room_number));
    const roomNumbersStr = roomNumbersArr.join(", ");

    // ─── 2) Determine group‐level icons (no duplicates):
    const groupHasAdult = grp.rooms.some((r) => r.adultQty > 0);
    const groupHasChild = grp.rooms.some((r) => r.childQty > 0);
    let groupHasSingleBed = false;
    let groupHasDoubleBed = false;
    grp.rooms.forEach((r) => {
      const bedName = bedTypesMap.get(r.bed_type) || "";
      if (
        bedName.toLowerCase().includes("2") ||
        bedName.toLowerCase().includes("double")
      ) {
        groupHasDoubleBed = true;
      } else {
        groupHasSingleBed = true;
      }
    });

    // ─── 3) Does any room in the group have Wi-Fi?
    const anyWifiInGroup = grp.rooms.some((r) =>
      (r.room_Facilities ?? []).some((fid) => {
        const mn = facilitiesMapMn.get(fid) || "";
        const en = facilitiesMapEn.get(fid) || "";
        return mn.toLowerCase().includes("wifi") || en.toLowerCase().includes("wifi");
      })
    );

    // ─── 4) Compute intersection of common “Ерөнхий онцлог зүйлс”
    let interFacilityIDs: number[] = grp.rooms[0]?.room_Facilities?.slice() ?? [];
    for (let i = 1; i < grp.rooms.length; i++) {
      const nextIDs = grp.rooms[i].room_Facilities ?? [];
      interFacilityIDs = interFacilityIDs.filter((id) => nextIDs.includes(id));
    }
    let interToiletryIDs: number[] = grp.rooms[0]?.free_Toiletries?.slice() ?? [];
    for (let i = 1; i < grp.rooms.length; i++) {
      const nextIDs = grp.rooms[i].free_Toiletries ?? [];
      interToiletryIDs = interToiletryIDs.filter((id) => nextIDs.includes(id));
    }
    let interFoodDrinkIDs: number[] = grp.rooms[0]?.food_And_Drink?.slice() ?? [];
    for (let i = 1; i < grp.rooms.length; i++) {
      const nextIDs = grp.rooms[i].food_And_Drink ?? [];
      interFoodDrinkIDs = interFoodDrinkIDs.filter((id) => nextIDs.includes(id));
    }
    let interOutdoorIDs: number[] = grp.rooms[0]?.outdoor_And_View?.slice() ?? [];
    for (let i = 1; i < grp.rooms.length; i++) {
      const nextIDs = grp.rooms[i].outdoor_And_View ?? [];
      interOutdoorIDs = interOutdoorIDs.filter((id) => nextIDs.includes(id));
    }
    const allCommonIDsSet = new Set<number>([
      ...interFacilityIDs,
      ...interToiletryIDs,
      ...interFoodDrinkIDs,
      ...interOutdoorIDs
    ]);
    const commonFeaturesIDs = Array.from(allCommonIDsSet);
    const commonFeaturesArr = commonFeaturesIDs
      .map((fid) => {
        return (
          facilitiesMapMn.get(fid) ??
          toiletriesMap.get(fid) ??
          foodDrinkMap.get(fid) ??
          outdoorViewMap.get(fid) ??
          undefined
        );
      })
      .filter((nm): nm is string => nm !== undefined);

    // ─── 5) Compute intersection of common “Угаалгын өрөөнд:”
    let interBathroomIDs: number[] = grp.rooms[0]?.bathroom_Items?.slice() ?? [];
    for (let i = 1; i < grp.rooms.length; i++) {
      const nextIDs = grp.rooms[i].bathroom_Items ?? [];
      interBathroomIDs = interBathroomIDs.filter((id) => nextIDs.includes(id));
    }
    const commonBathroomArr = interBathroomIDs
      .map((bid) => bathroomItemsMap.get(bid))
      .filter((nm): nm is string => nm !== undefined);

    // ─── 6) Collect up to 3 unique images for group row
    const allImages = grp.rooms.flatMap((r) => r.images.map((img) => img.image));
    const uniqueImages = Array.from(new Set(allImages)).slice(0, 3);

    // ─── 7) Push the GROUP row
    rows.push({
      id: key,                // e.g. “9-8”
      isGroup: true,
      arrowPlaceholder: key,

      // Column 2: Thumbnails
      images: uniqueImages,

      // Column 3: “Өрөөний нэр”
      categoryName: grp.category,
      typeName: grp.type,
      sizeGroup: grp.rooms[0]?.room_size,
      hasWifiGroup: anyWifiInGroup,

      // Column 4: “Өрөөний тоо / Зарах тоо”
      roomNumbersStr,   // comma-separated room numbers for the group

      // Column 4 leaf-only (unused)
      leafSize: undefined,
      smokingAllowed: undefined,
      hasWifi: undefined,

      // Column 5: icons only
      groupHasAdult,
      groupHasChild,
      groupHasSingleBed,
      groupHasDoubleBed,

      adultQty: undefined,
      childQty: undefined,
      bedType: undefined,

      // Column 6: common features
      commonFeaturesArr,
      thisRoomExtraFeaturesArr: undefined,

      // Column 7: common bathroom items
      commonBathroomArr,
      thisRoomExtraBathroomArr: undefined,

      // No leafRoomId for a group row
      leafRoomId: undefined
    });

    // ─── 8) If group is expanded, push each LEAF (individual room)
    if (expanded.has(key)) {
      grp.rooms.forEach((r) => {
        // Determine leaf’s bedType: 2 if “double” else 1
        const bedName = bedTypesMap.get(r.bed_type) || "";
        const bedTypeForIcon =
          bedName.toLowerCase().includes("2") ||
          bedName.toLowerCase().includes("double")
            ? 2
            : 1;

        // Does leaf have Wi-Fi?
        const hasWifiLeaf = (r.room_Facilities ?? []).some((fid) => {
          const mn = facilitiesMapMn.get(fid) || "";
          const en = facilitiesMapEn.get(fid) || "";
          return mn.toLowerCase().includes("wifi") || en.toLowerCase().includes("wifi");
        });

        // This room’s full feature list
        const thisFeatureNamesSet = new Set<string>();
        (r.room_Facilities ?? []).forEach((fid) => {
          const mn = facilitiesMapMn.get(fid);
          const en = facilitiesMapEn.get(fid);
          const nameToUse = mn || en;
          if (nameToUse) thisFeatureNamesSet.add(nameToUse);
        });
        (r.free_Toiletries ?? []).forEach((tid) => {
          const nm = toiletriesMap.get(tid);
          if (nm) thisFeatureNamesSet.add(nm);
        });
        (r.food_And_Drink ?? []).forEach((fdid) => {
          const nm = foodDrinkMap.get(fdid);
          if (nm) thisFeatureNamesSet.add(nm);
        });
        (r.outdoor_And_View ?? []).forEach((oid) => {
          const nm = outdoorViewMap.get(oid);
          if (nm) thisFeatureNamesSet.add(nm);
        });
        const thisRoomFeaturesArrFull = Array.from(thisFeatureNamesSet);

        // Compute extras vs. group’s commonFeaturesArr
        const extrasSet = new Set<string>(thisRoomFeaturesArrFull);
        commonFeaturesArr.forEach((cf) => {
          if (extrasSet.has(cf)) extrasSet.delete(cf);
        });
        const thisRoomExtraFeaturesArr = Array.from(extrasSet);

        // This room’s full bathroom item list
        const thisBathroomSet = new Set<string>();
        (r.bathroom_Items ?? []).forEach((bid) => {
          const nm = bathroomItemsMap.get(bid);
          if (nm) thisBathroomSet.add(nm);
        });
        const thisRoomBathroomArrFull = Array.from(thisBathroomSet);

        // Compute extras vs. group’s commonBathroomArr
        const extrasBathSet = new Set<string>(thisRoomBathroomArrFull);
        commonBathroomArr.forEach((cb) => {
          if (extrasBathSet.has(cb)) extrasBathSet.delete(cb);
        });
        const thisRoomExtraBathroomArr = Array.from(extrasBathSet);

        rows.push({
          id: `${key}-${r.room_number}`, // e.g. “9-8-12”
          isGroup: false,
          arrowPlaceholder: "",

          images: [],

          // Column 3: Leaf shows only roomNumber + description
          categoryName: undefined,
          typeName: undefined,
          sizeGroup: undefined,
          hasWifiGroup: undefined,

          roomNumberLeaf: String(r.room_number),
          viewDescription: r.room_Description,

          // Column 4: Leaf shows its size + smoking & Wi-Fi icons
          leafSize: r.room_size,
          roomNumbersStr: undefined,
          smokingAllowed: r.smoking_allowed,
          hasWifi: hasWifiLeaf,

          // Column 5: leaf fields
          groupHasAdult: undefined,
          groupHasChild: undefined,
          groupHasSingleBed: undefined,
          groupHasDoubleBed: undefined,

          adultQty: r.adultQty,
          childQty: r.childQty,
          bedType: bedTypeForIcon,

          // Column 6
          commonFeaturesArr: [],
          thisRoomExtraFeaturesArr,

          // Column 7
          commonBathroomArr: [],
          thisRoomExtraBathroomArr,

          // ─────────── NEW: store the numeric ID for edit / delete ───────────
          leafRoomId: r.id
        });
      });
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  // 8) Edit / Delete Handlers
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Called when the user clicks “Edit” (FaEdit) on a leaf row.
   * We find the corresponding RoomData in rawRooms, set it as selectedRoom,
   * and open the modal in “Edit” mode.
   */
  const handleEdit = (roomId: number | undefined) => {
    if (roomId == null) return;
    const found = rawRooms.find((r) => r.id === roomId);
    if (!found) {
      console.warn("Room to edit not found:", roomId);
      return;
    }
    setSelectedRoom(found);
    setIsModalOpen(true);
  };

  /**
   * Called when the user clicks “Delete” (FaTrashAlt) on a leaf row.
   * Sends DELETE to /api/roomsNew/<roomId>/?token=<token>, then refreshes the list.
   */
  const handleDelete = async (roomId: number | undefined) => {
    if (roomId == null) return;
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Token missing; cannot delete.");
      return;
    }
    if (
      !confirm(
        "Та үнэхээр энэ өрөөг устгахыг хүсэж байна уу? Энэ үйлдэл буцалтгүй."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `https://dev.kacc.mn/api/roomsNew/${roomId}/?token=${token}`,
        {
          method: "DELETE"
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete room.");
      }
      toast.success("Room deleted successfully.");
      // Trigger a re-fetch
      setIsRoomAdded(true);
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err.message || "Delete failed.");
    }
  };

  //////////////////////////////////////////////
  // 9) Column definitions (with Edit/Delete)
  //////////////////////////////////////////////
  const columns: GridColDef<FlattenRow>[] = [
    //
    // ── Column 1: Arrow ───────────────────────────────────────────────────────
    //
    {
      field: "arrowPlaceholder",
      headerName: "",
      width: 48,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          const grpKey = params.row.arrowPlaceholder!;
          return (
            <IconButton
              size="small"
              onClick={() => {
                const newSet = new Set(expanded);
                if (newSet.has(grpKey)) newSet.delete(grpKey);
                else newSet.add(grpKey);
                setExpanded(newSet);
              }}
            >
              {expanded.has(grpKey) ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          );
        }
        return null;
      }
    },

    //
    // ── Column 2: “Зураг” ──────────────────────────────────────────────────────
    //
    {
      field: "images",
      headerName: "Зураг",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (params.row.isGroup && params.value?.length) {
          return (
            <div style={{ display: "flex", gap: 4 }}>
              {params.value.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Room img ${idx}`}
                  style={{
                    height: 48,
                    width: 64,
                    objectFit: "cover",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setPreviewImages(params.value);
                    setCurrentImageIndex(idx);
                    setIsImageModalOpen(true);
                  }}
                />
              ))}
            </div>
          );
        }
        return null;
      }
    },

    //
    // ── Column 3: “Өрөөний нэр” ─────────────────────────────────────────────────
    //    Group: three lines — (1) category (bold), (2) type, (3) size + Wi-Fi icon
    //    Leaf: two lines — (1) roomNumberLeaf (bold), (2) viewDescription
    //
    {
      field: "categoryName",
      headerName: "Өрөөний нэр",
      flex: 2,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* 1) Category name bold */}
              <span style={{ fontWeight: 600 }}>{params.value} </span>
              {/* 2) Type name */}
              <span
                style={{
                  fontSize: "0.90rem",
                  color: "#333",
                  marginTop: 2
                }}
              >
                {params.row.typeName}
              </span>
              {/* 3) size + Wi-Fi */}
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 2
                }}
              >
                {params.row.sizeGroup} м²{" "}
                {params.row.hasWifiGroup ? (
                  <AiOutlineWifi color="#000" size={16} />
                ) : (
                  <AiOutlineWifi color="#aaa" size={16} />
                )}
              </span>
            </div>
          );
        } else {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* 1) Room number bold */}
              <span style={{ fontWeight: 600 }}>{params.row.roomNumberLeaf}</span>
              {/* 2) View description */}
              <span style={{ fontSize: "0.85rem", color: "#555" }}>
                {params.row.viewDescription}
              </span>
            </div>
          );
        }
      }
    },

    //
    // ── Column 4: “Өрөөний тоо / Зарах тоо” ────────────────────────────────────
    //    Group: single line = comma-separated roomNumbers
    //    Leaf: two lines — (1) size bold, (2) smoking + Wi-Fi icons
    //
    {
      field: "roomNumbersStr",
      headerName: "Өрөөний тоо / Зарах тоо",
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <span style={{ fontSize: "0.85rem", color: "#555" }}>
              {params.value}
            </span>
          );
        } else {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* 1) size */}
              <span style={{ fontWeight: 600 }}>{params.row.leafSize} м²</span>
              {/* 2) smoking + Wi-Fi */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 2
                }}
              >
                {params.row.smokingAllowed ? (
                  <GiCigarette color="#000" size={16} />
                ) : (
                  <LiaSmokingBanSolid color="#d00" size={16} />
                )}
                {params.row.hasWifi ? (
                  <AiOutlineWifi color="#000" size={16} />
                ) : (
                  <AiOutlineWifi color="#aaa" size={16} />
                )}
              </span>
            </div>
          );
        }
      }
    },

    //
    // ── Column 5: “Хүний тоо / Орны тоо” ────────────────────────────────────────
    //
    {
      field: "groupHasAdult",
      headerName: "Хүний тоо / Орны тоо",
      flex: 2,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {params.row.groupHasAdult && <IoPerson />}
              {params.row.groupHasChild && <FaChild />}
              {params.row.groupHasSingleBed && <LuBedSingle size={18} />}
              {params.row.groupHasDoubleBed && <LuBedDouble size={18} />}
            </div>
          );
        } else {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <IoPerson /> <span>{params.row.adultQty}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <FaChild /> <span>{params.row.childQty}</span>
              </div>
              {params.row.bedType === 2 ? (
                <LuBedDouble size={18} />
              ) : (
                <LuBedSingle size={18} />
              )}
            </div>
          );
        }
      }
    },

    //
    // ── Column 6: “Ерөнхий онцлог зүйлс” ────────────────────────────────────────
    //
    {
      field: "commonFeaturesArr",
      headerName: "Ерөнхий онцлог зүйлс",
      flex: 3,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(params.value as string[]).map((feat: string, idx: number) => (
                <span
                  key={idx}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <FaCheck color="green" /> <span>{feat}</span>
                </span>
              ))}
            </div>
          );
        } else {
          const arr: string[] = params.row.thisRoomExtraFeaturesArr || [];
          if (arr.length === 0) return null;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {arr.map((feat, i) => (
                <span
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <AiOutlinePlus color="green" /> <span>{feat}</span>
                </span>
              ))}
            </div>
          );
        }
      }
    },

    //
    // ── Column 7: “Угаалгын өрөөнд:” ─────────────────────────────────────────────
    //
    {
      field: "commonBathroomArr",
      headerName: "Угаалгын өрөөнд:",
      flex: 2.5,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isGroup) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(params.value as string[]).map((item: string, idx: number) => (
                <span
                  key={idx}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <FaCheck color="green" /> <span>{item}</span>
                </span>
              ))}
            </div>
          );
        } else {
          const arr: string[] = params.row.thisRoomExtraBathroomArr || [];
          if (arr.length === 0) return null;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {arr.map((item, i) => (
                <span
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <AiOutlinePlus color="green" /> <span>{item}</span>
                </span>
              ))}
            </div>
          );
        }
      }
    },

    //
    // ── Column 8: “Засах” (Edit + Delete) ──────────────────────────────────────
    //
    {
      field: "actions",
      headerName: "Засах",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        // Only show edit/delete for leaf rows (not for group headers)
        if (!params.row.isGroup && params.row.leafRoomId != null) {
          const rid = params.row.leafRoomId;
          return (
            <div style={{ display: "flex", gap: 8 }}>
              {/* Edit Icon */}
              <IconButton
                size="small"
                onClick={() => handleEdit(rid)}
                title="Edit Room"
              >
                <FaEdit />
              </IconButton>

              {/* Delete Icon */}
              <IconButton
                size="small"
                onClick={() => handleDelete(rid)}
                title="Delete Room"
              >
                <FaTrashAlt />
              </IconButton>
            </div>
          );
        }
        return null;
      }
    }
  ];

  return (
    <div className="w-full">
      {/* ─── Top Bar: “Өрөө бүртгэл” + “+ Өрөө нэмэх” ─────────────────────── */}
      <div className="flex justify-between mb-4">
        <h1 className="text-lg font-semibold">Өрөө бүртгэл</h1>
        <button
          onClick={() => {
            // Open modal in “Create” mode (clear any selectedRoom)
            setSelectedRoom(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-300 rounded-md text-white px-4 py-2 transition"
        >
          + Өрөө нэмэх
        </button>
      </div>

      {/* ─── RoomModal (Create / Edit) ─────────────────────────────────────────── */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomToEdit={selectedRoom}          
        isRoomAdded={isRoomAdded}
        setIsRoomAdded={setIsRoomAdded}
      />

      {/* ─── DataGrid or Loading Spinner ─────────────────────────── */}
      <div style={{ width: tableWidth, height: "80vh" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="mb-2 font-semibold">Rooms ({rows.length})</div>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              pagination
              autoPageSize={false}
              pageSizeOptions={[5, 10, 20, 50]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 300 }
                }
              }}
              // Let row height auto‐grow to fit multiline content:
              autoHeight
              getRowHeight={() => "auto"}

              sx={{
                border: "none",
                borderRadius: 2,
                "& .MuiDataGrid-cell": {
                  alignItems: "start",
                  whiteSpace: "normal"
                }
              }}
            />
          </>
        )}
      </div>

      {/* ─── Image Preview Modal ───────────────────────────────────── */}
      <Dialog
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Room Images</DialogTitle>
        <DialogContent className="flex justify-center items-center">
          {previewImages.length > 0 && (
            <img
              src={previewImages[currentImageIndex]}
              alt="Room preview"
              style={{
                maxHeight: "70vh",
                maxWidth: "100%",
                objectFit: "contain"
              }}
            />
          )}
        </DialogContent>
        <DialogActions className="justify-between px-6">
          <Button
            onClick={() =>
              setCurrentImageIndex((prev) =>
                prev > 0 ? prev - 1 : previewImages.length - 1
              )
            }
          >
            ◀ Previous
          </Button>
          <Button onClick={() => setIsImageModalOpen(false)}>Close</Button>
          <Button
            onClick={() =>
              setCurrentImageIndex((prev) => (prev + 1) % previewImages.length)
            }
          >
            Next ▶
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
