import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, DollarSign, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { LocalStorage, STORAGE_KEYS } from '../utils/storage';
import './Projects.css';

interface Project {
  id: number;
  name: string;
  description: string;
  client: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  budget: number;
  actualRevenue?: number;
  teamMembers: string[];
  progress: number;
  deliverables: Deliverable[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedDate?: string;
}

interface Deliverable {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'review';
  assignee: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<{id: number, name: string, role: string}[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    status: 'planning',
    isActive: true,
    priority: 'medium',
    progress: 0,
    deliverables: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [newDeliverable, setNewDeliverable] = useState<Partial<Deliverable>>({
    status: 'pending'
  });

  useEffect(() => {
    const savedProjects = LocalStorage.get<Project[]>(STORAGE_KEYS.PROJECTS_DATA);
    const savedMembers = LocalStorage.get<{id: number, name: string, role: string}[]>(STORAGE_KEYS.TEAM_MEMBERS);
    
    if (savedProjects && savedProjects.length > 0) {
      setProjects(savedProjects);
    }
    if (savedMembers && savedMembers.length > 0) {
      setTeamMembers(savedMembers);
    }
  }, []);

  const addProject = () => {
    if (newProject.name && newProject.client && newProject.startDate) {
      const project: Project = {
        id: Date.now(),
        name: newProject.name,
        description: newProject.description || '',
        client: newProject.client,
        status: newProject.status as Project['status'],
        isActive: newProject.isActive !== false,
        priority: newProject.priority as Project['priority'],
        startDate: newProject.startDate,
        endDate: newProject.endDate || '',
        budget: newProject.budget || 0,
        teamMembers: newProject.teamMembers || [],
        progress: newProject.progress || 0,
        deliverables: newProject.deliverables || [],
        notes: newProject.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedProjects = [...projects, project];
      setProjects(updatedProjects);
      LocalStorage.set(STORAGE_KEYS.PROJECTS_DATA, updatedProjects);
      
      setNewProject({
        status: 'planning',
        isActive: true,
        priority: 'medium',
        progress: 0,
        deliverables: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowProjectModal(false);
    }
  };

  const addDeliverable = () => {
    if (newDeliverable.name && newDeliverable.assignee && selectedProject) {
      const deliverable: Deliverable = {
        id: Date.now(),
        name: newDeliverable.name,
        description: newDeliverable.description || '',
        dueDate: newDeliverable.dueDate || '',
        status: newDeliverable.status as Deliverable['status'],
        assignee: newDeliverable.assignee
      };
      
      const updatedProjects = projects.map(project => 
        project.id === selectedProject.id 
          ? { ...project, deliverables: [...project.deliverables, deliverable], updatedAt: new Date().toISOString() }
          : project
      );
      
      setProjects(updatedProjects);
      LocalStorage.set(STORAGE_KEYS.PROJECTS_DATA, updatedProjects);
      setSelectedProject({ ...selectedProject, deliverables: [...selectedProject.deliverables, deliverable] });
      setNewDeliverable({ status: 'pending' });
      setShowDeliverableModal(false);
    }
  };

  const updateProjectProgress = (projectId: number, progress: number) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId 
        ? { ...project, progress, updatedAt: new Date().toISOString() }
        : project
    );
    setProjects(updatedProjects);
    LocalStorage.set(STORAGE_KEYS.PROJECTS_DATA, updatedProjects);
  };

  const updateProjectStatus = (projectId: number, status: Project['status'], actualRevenue?: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updates: Partial<Project> = {
          ...project,
          status,
          updatedAt: new Date().toISOString()
        };
        
        if (status === 'completed') {
          updates.completedDate = new Date().toISOString();
          updates.actualRevenue = actualRevenue || project.budget;
        }
        
        return updates as Project;
      }
      return project;
    });
    setProjects(updatedProjects);
    LocalStorage.set(STORAGE_KEYS.PROJECTS_DATA, updatedProjects);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return '#9E9E9E';
      case 'active': return '#4CAF50';
      case 'in-progress': return '#2196F3';
      case 'review': return '#FF9800';
      case 'completed': return '#4CAF50';
      case 'on-hold': return '#FF5722';
      case 'paused': return '#FFC107';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF5252';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return '計画中';
      case 'active': return 'アクティブ';
      case 'in-progress': return '進行中';
      case 'review': return 'レビュー中';
      case 'completed': return '完了';
      case 'on-hold': return '保留';
      case 'paused': return '一時停止';
      default: return status;
    }
  };

  return (
    <div className="projects">
      <div className="projects-header">
        <h1>📋 案件管理</h1>
        <p className="projects-subtitle">プロジェクトと納品物の進捗管理</p>
        <div className="header-actions">
          <button className="add-project-btn" onClick={() => setShowProjectModal(true)}>
            <Plus size={20} />
            新規案件追加
          </button>
        </div>
      </div>

      <div className="projects-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
            <CheckCircle size={24} color="#4CAF50" />
          </div>
          <div className="stat-content">
            <p className="stat-label">アクティブ案件</p>
            <p className="stat-value">{projects.filter(p => p.isActive).length}件</p>
            <p className="stat-detail">進行中: {projects.filter(p => p.status === 'in-progress' && p.isActive).length}件</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E3F2FD' }}>
            <Clock size={24} color="#2196F3" />
          </div>
          <div className="stat-content">
            <p className="stat-label">完了案件</p>
            <p className="stat-value">{projects.filter(p => p.status === 'completed').length}件</p>
            <p className="stat-detail">今月: {projects.filter(p => {
              if (p.completedDate) {
                const completedDate = new Date(p.completedDate);
                const now = new Date();
                return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
              }
              return false;
            }).length}件</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FFF3E0' }}>
            <DollarSign size={24} color="#FF9800" />
          </div>
          <div className="stat-content">
            <p className="stat-label">今月の成約金額</p>
            <p className="stat-value">¥{projects.filter(p => {
              if (p.status === 'completed' && p.completedDate) {
                const completedDate = new Date(p.completedDate);
                const now = new Date();
                return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
              }
              return false;
            }).reduce((sum, p) => sum + (p.actualRevenue || p.budget), 0).toLocaleString()}</p>
            <p className="stat-detail">予算合計: ¥{projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FFEBEE' }}>
            <AlertCircle size={24} color="#FF5252" />
          </div>
          <div className="stat-content">
            <p className="stat-label">保留中</p>
            <p className="stat-value">{projects.filter(p => p.status === 'on-hold').length}件</p>
            <p className="stat-detail">高優先度: {projects.filter(p => p.priority === 'high' && p.isActive).length}件</p>
          </div>
        </div>
      </div>

      {projects.length === 0 && (
        <div className="no-projects">
          <h3>案件がありません</h3>
          <p>「新規案件追加」ボタンから案件を追加してください</p>
        </div>
      )}

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h3>{project.name}</h3>
              <div className="project-badges">
                {project.isActive ? (
                  <span className="active-badge" style={{ backgroundColor: '#4CAF50' }}>
                    アクティブ
                  </span>
                ) : (
                  <span className="active-badge" style={{ backgroundColor: '#9E9E9E' }}>
                    非アクティブ
                  </span>
                )}
                <span className="status-badge" style={{ backgroundColor: getStatusColor(project.status) }}>
                  {getStatusLabel(project.status)}
                </span>
                <span className="priority-badge" style={{ backgroundColor: getPriorityColor(project.priority) }}>
                  {project.priority === 'high' ? '高' : project.priority === 'medium' ? '中' : '低'}
                </span>
              </div>
            </div>
            
            <div className="project-info">
              <p><strong>クライアント:</strong> {project.client}</p>
              <p><strong>期間:</strong> {project.startDate} ～ {project.endDate}</p>
              <p><strong>予算:</strong> ¥{project.budget.toLocaleString()}</p>
              {project.actualRevenue && project.actualRevenue !== project.budget && (
                <p><strong>実収益:</strong> ¥{project.actualRevenue.toLocaleString()}</p>
              )}
              {project.completedDate && (
                <p><strong>完了日:</strong> {new Date(project.completedDate).toLocaleDateString('ja-JP')}</p>
              )}
              <p><strong>チーム:</strong> {project.teamMembers.join(', ')}</p>
            </div>

            <div className="project-progress">
              <div className="progress-header">
                <span>進捗</span>
                <span>{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="project-deliverables">
              <h4>納品物 ({project.deliverables.length}件)</h4>
              {project.deliverables.slice(0, 3).map(deliverable => (
                <div key={deliverable.id} className="deliverable-item">
                  <span className="deliverable-name">{deliverable.name}</span>
                  <span className="deliverable-status" style={{ backgroundColor: getStatusColor(deliverable.status) }}>
                    {deliverable.status === 'pending' ? '未着手' : 
                     deliverable.status === 'in-progress' ? '進行中' :
                     deliverable.status === 'completed' ? '完了' : 'レビュー中'}
                  </span>
                </div>
              ))}
              {project.deliverables.length > 3 && (
                <p className="more-deliverables">+{project.deliverables.length - 3}件</p>
              )}
            </div>

            <div className="project-actions">
              <button 
                className="action-btn"
                onClick={() => {
                  setSelectedProject(project);
                  setShowDeliverableModal(true);
                }}
              >
                納品物追加
              </button>
              {project.status === 'completed' ? (
                <button 
                  className="action-btn completed"
                  disabled
                >
                  完了済み
                </button>
              ) : (
                <button 
                  className="action-btn secondary"
                  onClick={() => {
                    if (project.status === 'review' || project.status === 'in-progress') {
                      const revenue = window.prompt('実収益金額を入力してください（空欄の場合は予算金額を使用）:', project.budget.toString());
                      if (revenue !== null) {
                        updateProjectStatus(project.id, 'completed', parseInt(revenue) || project.budget);
                      }
                    } else {
                      setSelectedProject(project);
                    }
                  }}
                >
                  {project.status === 'review' || project.status === 'in-progress' ? '完了にする' : '詳細表示'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <h2>新規案件追加</h2>
            <div className="form-row">
              <div className="form-group">
                <label>案件名 *</label>
                <input
                  type="text"
                  value={newProject.name || ''}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Webサイト制作プロジェクト"
                />
              </div>
              <div className="form-group">
                <label>クライアント *</label>
                <input
                  type="text"
                  value={newProject.client || ''}
                  onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                  placeholder="株式会社サンプル"
                />
              </div>
            </div>
            <div className="form-group">
              <label>案件説明</label>
              <textarea
                value={newProject.description || ''}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                placeholder="案件の詳細説明"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>開始日 *</label>
                <input
                  type="date"
                  value={newProject.startDate || ''}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>終了予定日</label>
                <input
                  type="date"
                  value={newProject.endDate || ''}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>予算</label>
                <input
                  type="number"
                  value={newProject.budget || ''}
                  onChange={(e) => setNewProject({ ...newProject, budget: parseInt(e.target.value) || 0 })}
                  placeholder="1000000"
                />
              </div>
              <div className="form-group">
                <label>ステータス</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value as Project['status'] })}
                >
                  <option value="planning">計画中</option>
                  <option value="in-progress">進行中</option>
                  <option value="review">レビュー中</option>
                  <option value="completed">完了</option>
                  <option value="on-hold">保留</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>優先度</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as Project['priority'] })}
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <div className="form-group">
                <label>アクティブステータス</label>
                <select
                  value={newProject.isActive !== false ? 'active' : 'inactive'}
                  onChange={(e) => setNewProject({ ...newProject, isActive: e.target.value === 'active' })}
                >
                  <option value="active">アクティブ</option>
                  <option value="inactive">非アクティブ</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>チームメンバー</label>
              <div className="team-members-list">
                {teamMembers.map(member => (
                  <label key={member.id} className="member-checkbox">
                    <input
                      type="checkbox"
                      checked={newProject.teamMembers?.includes(member.name) || false}
                      onChange={(e) => {
                        const members = newProject.teamMembers || [];
                        if (e.target.checked) {
                          setNewProject({ ...newProject, teamMembers: [...members, member.name] });
                        } else {
                          setNewProject({ ...newProject, teamMembers: members.filter(name => name !== member.name) });
                        }
                      }}
                    />
                    {member.name} ({member.role})
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>メモ・備考</label>
              <textarea
                value={newProject.notes || ''}
                onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                rows={3}
                placeholder="案件に関する追加情報や注意事項"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowProjectModal(false)}>キャンセル</button>
              <button className="save-btn" onClick={addProject}>案件を追加</button>
            </div>
          </div>
        </div>
      )}

      {showDeliverableModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowDeliverableModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>納品物追加 - {selectedProject.name}</h2>
            <div className="form-group">
              <label>納品物名 *</label>
              <input
                type="text"
                value={newDeliverable.name || ''}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, name: e.target.value })}
                placeholder="デザインカンプ"
              />
            </div>
            <div className="form-group">
              <label>説明</label>
              <textarea
                value={newDeliverable.description || ''}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                rows={3}
                placeholder="納品物の詳細説明"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>担当者 *</label>
                <select
                  value={newDeliverable.assignee || ''}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, assignee: e.target.value })}
                >
                  <option value="">担当者を選択</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.name}>{member.name} ({member.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>期限</label>
                <input
                  type="date"
                  value={newDeliverable.dueDate || ''}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeliverableModal(false)}>キャンセル</button>
              <button className="save-btn" onClick={addDeliverable}>納品物を追加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
