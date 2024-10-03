import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Channel, Region, Category, Language, Country } from '@/types';

import channels from '@/data/channels.json';
import regions from '@/data/regions.json';
import categories from '@/data/categories.json';
import languages from '@/data/languages.json';
import countries from '@/data/countries.json';
import { router, Stack } from 'expo-router';
import { Text } from '@/components';

const ITEMS_PER_PAGE = 20;

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
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

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, filters, setFilters, options }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filters</Text>
          {Object.keys(options).map((key) => (
            <View key={key} style={styles.filterSection}>
              <Text style={styles.filterTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <FlatList
                data={options[key as keyof typeof options]}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.filterItem,
                      filters[key as keyof FilterState].includes(item.id) && styles.filterItemSelected,
                    ]}
                    onPress={() => {
                      const updatedFilters = { ...filters };
                      if (updatedFilters[key as keyof FilterState].includes(item.id)) {
                        updatedFilters[key as keyof FilterState] = updatedFilters[key as keyof FilterState].filter((id) => id !== item.id);
                      } else {
                        updatedFilters[key as keyof FilterState].push(item.id);
                      }
                      setFilters(updatedFilters);
                    }}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                horizontal
              />
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const TVChannelsScreen: React.FC = () => {
  const [displayedChannels, setDisplayedChannels] = useState<Channel[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({
    country: [],
    category: [],
    language: [],
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const loadChannels = useCallback((refresh: boolean = false) => {
    if (loading || (!hasMore && !refresh)) return;
    setLoading(true);

    const startIndex = refresh ? 0 : (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const filteredChannels = channels.filter((channel) => {
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = filters.country.length === 0 || filters.country.includes(channel.country);
      const matchesCategory = filters.category.length === 0 || channel.categories.some((cat) => filters.category.includes(cat));
      const matchesLanguage = filters.language.length === 0 || channel.languages.some((lang) => filters.language.includes(lang));
      return matchesSearch && matchesCountry && matchesCategory && matchesLanguage;
    });

    const newChannels = filteredChannels.slice(startIndex, endIndex);

    setDisplayedChannels((prevChannels) => (refresh ? newChannels : [...prevChannels, ...newChannels]));
    setPage((prevPage) => (refresh ? 2 : prevPage + 1));
    setHasMore(endIndex < filteredChannels.length);
    setLoading(false);
    setRefreshing(false);
  }, [page, loading, hasMore, searchTerm, filters]);

  useEffect(() => {
    loadChannels(true);
  }, [searchTerm, filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadChannels(true);
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

  return (
    <>
    <Stack.Screen
      options={{
        title: "TV",
        headerRight: ()=> (
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              
            }}
          >
            <TouchableOpacity
              onPress={()=>setFilterModalVisible(true)}
              style={{
                padding: 8,
                borderRadius: 12
              }}
            >
              <Ionicons name={"filter"} color={"#f1f1f1"} size={26} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={()=> router.navigate("/favourites")}
              style={{
                padding: 8,
                borderRadius: 12
              }}
            >
              <Ionicons name={"heart"} color={"#f1f1f1"} size={26} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={()=> router.navigate("/search")}
              style={{
                padding: 8,
                borderRadius: 12
              }}
            >
              <Ionicons name={"search"} color={"#f1f1f1"} size={26} />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.input}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search channels..."
          />
        </View>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={displayedChannels}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => loadChannels()}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={() => loading && <View
          style={{padding: 120}}
        >
          <ActivityIndicator size="large" color="#0000ff" />
          </View>}
      />
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        setFilters={setFilters}
        options={{
          country: countries,
          category: categories,
          language: languages,
        }}
      />
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100F10',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#100F10',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#100F10',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterItem: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  filterItemSelected: {
    backgroundColor: '#007AFF',
  },
});

export default TVChannelsScreen;