import React, { useState, useCallback, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import type {
  Map,
  ExpressionSpecification,
} from 'maplibre-gl';

interface UseMapFiltersProps {
  mapRef: React.RefObject<maplibregl.Map | null>;
  isMapLoaded: boolean;
}

export function useMapFilters({ mapRef, isMapLoaded }: UseMapFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 5000000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedInvestmentTypes, setSelectedInvestmentTypes] = useState<string[]>([]);
  const priceRangeRef = useRef(priceRange);
  const selectedCategoriesRef = useRef(selectedCategories);
  const selectedInvestmentTypesRef = useRef(selectedInvestmentTypes);

  // Keep refs updated
  useEffect(() => {
    priceRangeRef.current = priceRange;
  }, [priceRange]);

  useEffect(() => {
    selectedCategoriesRef.current = selectedCategories;
  }, [selectedCategories]);

  useEffect(() => {
    selectedInvestmentTypesRef.current = selectedInvestmentTypes;
  }, [selectedInvestmentTypes]);

  const propertyCategories = ["Apartemen", "Ruko", "Rumah", "Gudang", "Kos"];
  const investmentTypes = ["Jual", "Beli"]; // New investment types

  // Create a memoized filter function
  const applyPropertiesFilter = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const propertiesLayerId = "properties";

    // Check if style is loaded
    if (!map.isStyleLoaded()) {
      console.log("Style is not loaded yet");
      return;
    }

    // Check if properties layer exists
    if (!map.getLayer(propertiesLayerId)) {
      console.log("Properties layer not found");
      return;
    }

    // Build filter conditions
    let filterConditions: ExpressionSpecification[] = [
      [">=", ["get", "property_price"], priceRangeRef.current[0]],
      ["<=", ["get", "property_price"], priceRangeRef.current[1]],
    ];

    // Add category filter if selected
    if (selectedCategoriesRef.current.length > 0) {
      filterConditions.push([
        "in",
        ["get", "property_category"],
        ["literal", selectedCategoriesRef.current],
      ]);
    }

    // Add investment type filter if selected
    const currentInvestmentTypes = selectedInvestmentTypesRef.current;
    if (currentInvestmentTypes.length === 0) {
      // No investment types selected, show all
      filterConditions.push(["has", "property_status"]);
    } else if (currentInvestmentTypes.length === 1) {
      // Single investment type selected
      filterConditions.push([
        "==",
        ["get", "property_status"],
        currentInvestmentTypes[0],
      ]);
    } else {
      // Multiple investment types selected (Jual and Beli)
      filterConditions.push([
        "any",
        ["==", ["get", "property_status"], "Jual"],
        ["==", ["get", "property_status"], "Beli"],
      ]);
    }

    // Apply filter
    map.setFilter(propertiesLayerId, ["all", ...filterConditions]);
    map.setLayoutProperty(propertiesLayerId, "visibility", "visible");
  }, [mapRef, selectedCategoriesRef]);

  // Update the price change handler
  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    // Apply filter immediately when price changes
    applyPropertiesFilter();
  };

  // Effect to apply filters when investment types change
  useEffect(() => {
    applyPropertiesFilter();
  }, [selectedInvestmentTypes, applyPropertiesFilter]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleInvestmentTypeChange = (type: string) => {
    setSelectedInvestmentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return {
    priceRange,
    selectedCategories,
    selectedInvestmentTypes,
    propertyCategories,
    investmentTypes,
    handlePriceChange,
    handleCategoryChange,
    handleInvestmentTypeChange,
  };
}