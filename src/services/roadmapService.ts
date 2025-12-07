import { apiRequest } from "./api";

export interface RoadmapItem {
  id: string;
  idEvent: string;
  category: string;
  title: string;
  description: string;
  price: string;
  status: 'PLANNING' | 'SEARCHING' | 'CONTRACTED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  supplierId?: string;
}

export interface RoadmapResponse {
  success: boolean;
  message: string;
  data: RoadmapItem[] | RoadmapItem;
}

export interface UpdateRoadmapData {
  category?: string;
  title?: string;
  description?: string;
  price?: number;
  status?: string;
}

export const roadmapService = {
  async getRoadmapByEventId(eventId: string): Promise<RoadmapItem[]> {
    const response = await apiRequest(`/roadmaps/eventId/${eventId}`) as RoadmapResponse;
    return Array.isArray(response.data) ? response.data : [];
  },

  async getRoadmapById(id: string): Promise<RoadmapItem | null> {
    const response = await apiRequest(`/roadmaps/${id}`) as RoadmapResponse;
    return Array.isArray(response.data) ? null : response.data;
  },

  async createRoadmap(data: {
    idEvent: string;
    category: string;
    title: string;
    description: string;
    price: number;
    status: string;
  }): Promise<RoadmapItem> {
    const response = await apiRequest('/roadmaps/', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as RoadmapResponse;
    return response.data as RoadmapItem;
  },

  async updateRoadmap(id: string, data: UpdateRoadmapData): Promise<RoadmapItem> {
    const response = await apiRequest(`/roadmaps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }) as RoadmapResponse;
    return response.data as RoadmapItem;
  },

  async deleteRoadmap(id: string): Promise<void> {
    await apiRequest(`/roadmaps/${id}`, {
      method: 'DELETE',
    });
  },
};
