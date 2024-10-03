import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Image, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/components';
import { Channel } from '@/types';
import channels from '@/data/channels.json';
import countries from '@/data/countries.json';
import languages from '@/data/languages.json';
import categories from '@/data/categories.json';

const ITEMS_PER_PAGE = 20;

const SearchScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const searchChannels = useCallback((refresh: boolean = false) => {
    if (loading || (!hasMore && !refresh)) return;
    setLoading(true);

    const startIndex = refresh ? 0 : (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const filteredChannels = channels.filter((channel) =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const newResults = filteredChannels.slice(startIndex, endIndex);

    setSearchResults((prevResults) => (refresh ? newResults : [...prevResults, ...newResults]));
    setPage((prevPage) => (refresh ? 2 : prevPage + 1));
    setHasMore(endIndex < filteredChannels.length);
    setLoading(false);
  }, [searchTerm, page, loading, hasMore]);

  useEffect(() => {
    if (searchTerm) {
      setPage(1);
      searchChannels(true);
    } else {
      setSearchResults([]);
      setHasMore(true);
    }
  }, [searchTerm]);

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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Search',
        }}
      />
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.input}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search channels..."
            placeholderTextColor="#666"
          />
        </View>
      </View>
      <FlatList
        data={searchResults}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => searchChannels()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchTerm ? 'No results found' : 'Start typing to search channels'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100F10',
  },
  searchContainer: {
    margin: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#f1f1f1',
    padding: 12,
  },
  channelItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
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
    color: '#f1f1f1',
  },
  loadingContainer: {
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SearchScreen;