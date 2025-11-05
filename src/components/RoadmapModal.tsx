import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Spin,
  Empty,
  Card,
  Tag,
  Popconfirm,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { roadmapService, RoadmapItem } from '../services/roadmapService';

const { TextArea } = Input;

interface RoadmapModalProps {
  open: boolean;
  eventId: string;
  eventTitle: string;
  onCancel: () => void;
}

const categories = [
  { label: 'Casamento', value: 'WEDDING' },
  { label: 'Aniversário', value: 'BIRTHDAY' },
  { label: 'Corporativo', value: 'CORPORATE' },
  { label: 'Formatura', value: 'GRADUATION' },
  { label: 'Outro', value: 'OTHER' }
];

const statuses = [
  { label: 'Planejando', value: 'PLANNING', color: 'blue' },
  { label: 'Buscando', value: 'SEARCHING', color: 'orange' },
  { label: 'Contratado', value: 'CONTRACTED', color: 'green' },
  { label: 'Concluído', value: 'COMPLETED', color: 'purple' }
];

export function RoadmapModal({ open, eventId, eventTitle, onCancel }: RoadmapModalProps) {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && eventId) {
      loadRoadmapItems();
    }
  }, [open, eventId]);

  const loadRoadmapItems = async () => {
    try {
      setLoading(true);
      const data = await roadmapService.getRoadmapByEventId(eventId);
      setItems(data);
    } catch (error) {
      console.error('Error loading roadmap:', error);
      message.error('Erro ao carregar roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setShowAddModal(true);
  };

  const handleEdit = (item: RoadmapItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      category: item.category,
      title: item.title,
      description: item.description,
      price: item.price ? parseFloat(item.price) : undefined,
      status: item.status
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      if (editingItem) {
        await roadmapService.updateRoadmap(editingItem.id, {
          ...values,
        });
        message.success('Item atualizado com sucesso!');
      } else {
        await roadmapService.createRoadmap({
          idEvent: eventId,
          category: values.category,
          title: values.title,
          description: values.description,
          price: values.price || 0,
          status: values.status || 'PLANNING'
        });
        message.success('Item adicionado com sucesso!');
      }

      setShowAddModal(false);
      form.resetFields();
      setEditingItem(null);
      await loadRoadmapItems();
    } catch (error) {
      console.error('Error saving roadmap item:', error);
      message.error('Erro ao salvar item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await roadmapService.deleteRoadmap(itemId);
      message.success('Item removido com sucesso!');
      await loadRoadmapItems();
    } catch (error) {
      console.error('Error deleting roadmap item:', error);
      message.error('Erro ao remover item');
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: RoadmapItem['status']) => {
    try {
      await roadmapService.updateRoadmap(itemId, { status: newStatus });
      message.success('Status atualizado!');
      await loadRoadmapItems();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Erro ao atualizar status');
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status);
    return (
      <Tag color={statusConfig?.color || 'default'}>
        {statusConfig?.label || status}
      </Tag>
    );
  };

  const stats = {
    total: items.length,
    planning: items.filter(i => i.status === 'PLANNING').length,
    searching: items.filter(i => i.status === 'SEARCHING').length,
    contracted: items.filter(i => i.status === 'CONTRACTED').length,
    completed: items.filter(i => i.status === 'COMPLETED').length
  };

  return (
    <>
      <Modal
        title={`Roadmap - ${eventTitle}`}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-blue-800">Total</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.planning}</div>
                <div className="text-xs text-orange-800">Planejando</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.contracted}</div>
                <div className="text-xs text-green-800">Contratado</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
                <div className="text-xs text-purple-800">Concluído</div>
              </div>
            </Col>
          </Row>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            block
          >
            Adicionar Item
          </Button>

          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <Card
                  key={item.id}
                  size="small"
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(item)}
                        />
                        <Popconfirm
                          title="Tem certeza que deseja remover?"
                          onConfirm={() => handleDelete(item.id)}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusTag(item.status)}
                        <span className="text-sm font-medium text-green-600">
                          R$ {parseFloat(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <Select
                        size="small"
                        value={item.status}
                        onChange={(value) => handleStatusChange(item.id, value)}
                        style={{ width: 140 }}
                        options={statuses}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nenhum item adicionado ainda"
            >
              <Button type="primary" onClick={handleAdd}>
                Adicionar Primeiro Item
              </Button>
            </Empty>
          )}
        </div>
      </Modal>

      <Modal
        title={editingItem ? 'Editar Item' : 'Adicionar Item'}
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          form.resetFields();
          setEditingItem(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: 'Digite o título' }]}
          >
            <Input placeholder="Ex: Buffet, DJ, Decoração..." />
          </Form.Item>

          <Form.Item
            name="category"
            label="Categoria"
            rules={[{ required: true, message: 'Selecione a categoria' }]}
          >
            <Select
              placeholder="Selecione a categoria"
              options={categories}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descrição"
            rules={[{ required: true, message: 'Digite a descrição' }]}
          >
            <TextArea
              rows={3}
              placeholder="Descreva os detalhes do item..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Preço (R$)"
                rules={[{ required: true, message: 'Digite o preço' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  precision={2}
                  placeholder="0.00"
                  formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={value => value!.replace(/R\$\s?|(\.)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Selecione o status' }]}
              >
                <Select
                  placeholder="Selecione o status"
                  options={statuses}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0">
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  form.resetFields();
                  setEditingItem(null);
                }}
                block
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                block
              >
                {editingItem ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
