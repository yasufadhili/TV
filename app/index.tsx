import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';

import { Channel, Region, Category, Language, Country } from '@/types';

import channels from '@/data/channels.json';
import regions from '@/data/regions.json';
import categories from '@/data/categories.json';
import languages from '@/data/languages.json';
import countries from '@/data/countries.json';
import { router, Stack } from 'expo-router';
import { Text } from '@/components';

const ITEMS_PER_PAGE = 40;

interface FilterModalProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  options: {
    country: Country[];
    category: Category[];
    language: Language[];
  };
}

interface FilterState {
  country: string[];
  category: string[];
  language: string[];
}

const FilterBottomSheet: React.FC<FilterModalProps> = ({
  bottomSheetRef,
  filters,
  setFilters,
  options,
}) => {
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  const toggleFilter = (key: keyof FilterState, itemId: string) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      const filterList = updatedFilters[key];
      if (filterList.includes(itemId)) {
        updatedFilters[key] = filterList.filter((id) => id !== itemId);
      } else {
        updatedFilters[key] = [...filterList, itemId];
      }
      return updatedFilters;
    });
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Filters</Text>
        {Object.keys(options).map((key) => (
          <View key={key} style={styles.filterSection}>
            <Text style={styles.filterTitle}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <FlatList
              data={options[key as keyof typeof options]}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterItem,
                    filters[key as keyof FilterState].includes(item.id) &&
                      styles.filterItemSelected,
                  ]}
                  onPress={() => toggleFilter(key as keyof FilterState, item.id)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ))}
        <TouchableOpacity
          style={styles.button}
          onPress={() => bottomSheetRef.current?.close()}
        >
          <Text style={styles.buttonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const TVChannelsScreen: React.FC = () => {
  const [displayedChannels, setDisplayedChannels] = useState<Channel[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    country: [],
    category: [],
    language: [],
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Bottom Sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // Load channels based on filters
  const loadChannels = useCallback((refresh: boolean = false) => {
    if (loading || (!hasMore && !refresh)) return;
    setLoading(true);

    const startIndex = refresh ? 0 : (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const filteredChannels = channels.filter((channel) => {
      const matchesCountry = filters.country.length === 0 || filters.country.includes(channel.country);
      const matchesCategory = filters.category.length === 0 || channel.categories.some((cat) => filters.category.includes(cat));
      const matchesLanguage = filters.language.length === 0 || channel.languages.some((lang) => filters.language.includes(lang));
      return matchesCountry && matchesCategory && matchesLanguage;
    });

    const newChannels = filteredChannels.slice(startIndex, endIndex);

    setDisplayedChannels((prevChannels) => (refresh ? newChannels : [...prevChannels, ...newChannels]));
    setPage((prevPage) => (refresh ? 2 : prevPage + 1));
    setHasMore(endIndex < filteredChannels.length);
    setLoading(false);
    setRefreshing(false);
  }, [page, loading, hasMore, filters]);

  useEffect(() => {
    loadChannels(true);
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadChannels(true);
  };

  // Remove individual filters
  const removeFilter = (type: keyof FilterState, id: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [type]: prevFilters[type].filter((filterId) => filterId !== id),
    }));
  };

  const renderChannelItem = ({ item: channel }: { item: Channel }) => (
    <View style={styles.channelItem}>
      <Image source={{ uri: channel.logo }} style={styles.channelLogo} />
      <View style={styles.channelInfo}>
        <Text style={styles.channelName}>{channel.name}</Text>
        <Text>Country: {countries.find(c => c.code === channel.country)?.name || channel.country}</Text>
        <Text>Languages: {channel.languages.map(lang => languages.find(l => l.code === lang)?.name || lang).join(', ')}</Text>
        <Text>Categories: {channel.categories.map(cat => categories.find(c => c.id === cat)?.name || cat).join(', ')}</Text>
      </View>
    </View>
  );

  // Render applied filters as tags
  const renderFilterTags = () => {
    const tags = [];
    if (filters.country.length > 0) {
      filters.country.forEach((id) => {
        const country = countries.find(c => c.code === id);
        if (country) {
          tags.push({ type: 'country', label: country.name, id });
        }
      });
    }
    if (filters.category.length > 0) {
      filters.category.forEach((id) => {
        const category = categories.find(cat => cat.id === id);
        if (category) {
          tags.push({ type: 'category', label: category.name, id });
        }
      });
    }
    if (filters.language.length > 0) {
      filters.language.forEach((id) => {
        const language = languages.find(lang => lang.code === id);
        if (language) {
          tags.push({ type: 'language', label: language.name, id });
        }
      });
    }
    return tags;
  };

  return (
    <>
    <Stack.Screen
      options={{
        title: "TV",
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()} style={styles.headerButton}>
              <Ionicons name="filter" color="#f1f1f1" size={26} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/favourites")} style={styles.headerButton}>
              <Ionicons name="heart" color="#f1f1f1" size={26} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/search")} style={styles.headerButton}>
              <Ionicons name="search" color="#f1f1f1" size={26} />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
    <SafeAreaView style={styles.container}>
      {/* Render selected filters as horizontal tags */}
      {renderFilterTags().length > 0 && (
        <FlatList
          data={renderFilterTags()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.filterTag} onPress={() => removeFilter(item.type as keyof FilterState, item.id)}>
              <Text style={styles.filterTagText}>{item.label}</Text>
              <Ionicons name="close-circle" size={16} color="#fff" />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          horizontal
          contentContainerStyle={styles.filterTagsContainer}
          showsHorizontalScrollIndicator={false}
        />
      )}

      <FlatList
        data={displayedChannels}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => loadChannels()}
        onEndReachedThreshold={0.1}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={() => (
          loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )
        )}
      />
      <FilterBottomSheet
          bottomSheetRef={bottomSheetRef}
          filters={filters}
          setFilters={setFilters}
          options={{
            country: countries,
            category: categories,
            language: languages,
          }}
        />
        
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100F10',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
  },
  channelItem: {
    flexDirection: 'row',
    backgroundColor: '#100F10',
    margin: 8,
    padding: 12,
    borderRadius: 8,
  },
  channelLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  channelInfo: {
    marginLeft: 12,
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f1f1',
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  filterTagText: {
    color: '#fff',
    marginRight: 4,
  },
  filterTagsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1f1f1f',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  sheetContent: {
    flex: 1,
    padding: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSheetBackground: {
    backgroundColor: '#100F10',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  filterItem: {
    backgroundColor: '#3A3A3C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  filterItemSelected: {
    backgroundColor: '#007AFF',
  },
  activeFiltersContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  activeFiltersList: {
    paddingHorizontal: 8,
  },
  activeFilterItem: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default TVChannelsScreen;

   
