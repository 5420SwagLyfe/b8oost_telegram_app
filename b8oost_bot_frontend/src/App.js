import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

// Mock-пользователи
const mockUsers = [
    {
        id: 1,
        telegram_id: 123456789,
        username: 'employee_user',
        first_name: 'Employee',
        role: 'employee', // Роль сотрудника
    },
    {
        id: 2,
        telegram_id: 987654321,
        username: 'manager_user',
        first_name: 'Manager',
        role: 'manager', // Роль руководителя
    },
];

// Компонент для переключения пользователей
const UserSwitcher = ({ users, currentUser, onUserChange }) => {
    return (
        <div className="user-switcher">
            <label>
                Выберите пользователя:
                <select 
                    className="select-input"
                    value={currentUser.id}
                    onChange={(e) => {
                        const selectedUser = users.find(user => user.id === parseInt(e.target.value));
                        onUserChange(selectedUser);
                    }}
                >
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.first_name} ({user.role})
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
};

const App = () => {
    const [currentUser, setCurrentUser] = useState(mockUsers[0]); // По умолчанию выбран первый пользователь
    const [challengeRequests, setChallengeRequests] = useState([]);

    const [challengeName, setChallengeName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [rewardPoints, setRewardPoints] = useState(0);

    // Загрузка заявок на челлендж
    useEffect(() => {
        fetchChallengeRequests();
    }, [currentUser]);

    // Функция для загрузки заявок
    const fetchChallengeRequests = async () => {
        try {
            const response = await axios.get('/challenge-requests');
            setChallengeRequests(response.data);
        } catch (error) {
            console.error('Error fetching challenge requests:', error);
        }
    };

    // Функция для создания заявки
    const createChallengeRequest = async () => {
        const requestData = {
            userId: currentUser.id,
            challengeName: challengeName,
            category: category,
            description: description,
            rewardPoints: rewardPoints,
        };

        try {
            const response = await axios.post('/challenge-requests', requestData);
            alert('Заявка успешно создана!');
            console.log('Challenge request:', response.data);

            // Очистка формы
            setChallengeName('');
            setCategory('');
            setDescription('');
            setRewardPoints(0);

            // Обновляем список заявок
            fetchChallengeRequests();
        } catch (error) {
            console.error('Error creating challenge request:', error);
            alert('Не удалось создать заявку.');
        }
    };

    // Функция для обновления статуса заявки
    const updateRequestStatus = async (requestId, status) => {
        try {
            const response = await axios.post('http://localhost:5000/update-request-status', {
                requestId: requestId,
                status: status,
            });
            alert('Статус заявки обновлен!');
            console.log('Request status update:', response.data);

            // Обновляем список заявок
            fetchChallengeRequests();
        } catch (error) {
            console.error('Error updating request status:', error);
            alert('Не удалось обновить статус заявки.');
        }
    };

    // Меню для сотрудника
    const renderEmployeeMenu = () => (
        <div>
            <h2>Подать заявку на челлендж</h2>
            <form onSubmit={(e) => { e.preventDefault(); createChallengeRequest(); }}>
                <div>
                    <label>
                        Название челленджа:
                        <input
                            type="text"
                            className="text-input"
                            placeholder="Введите название"
                            value={challengeName}
                            onChange={(e) => setChallengeName(e.target.value)}
                            required
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Категория:
                        <select
                            className="select-input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Выберите категорию</option>
                            <option value="IT">IT</option>
                            <option value="Маркетинг">Маркетинг</option>
                            <option value="Дизайн">Дизайн</option>
                            <option value="Другое">Другое</option>
                        </select>
                    </label>
                </div>

                <div>
                    <label>
                        Описание:
                        <textarea
                            className="textarea-input"
                            placeholder="Введите описание"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Награда в виде баллов:
                        <input
                            type="number"
                            className="text-input"
                            placeholder="Введите количество баллов"
                            value={rewardPoints}
                            onChange={(e) => setRewardPoints(Number(e.target.value))}
                            required
                        />
                    </label>
                </div>

                <button type="submit" className="submit-button">Отправить заявку</button>
            </form>
        </div>
    );

    // Меню для руководителя
    const renderManagerMenu = () => (
        <div>
            <h2>Заявки на челлендж</h2>
            <ul>
                {challengeRequests.map((request, index) => (
                    <li key={index} className="challenge-card">
                        <h3>{request.challenge_name}</h3>
                        <p><strong>Категория:</strong> {request.category}</p>
                        <p><strong>Описание:</strong> {request.description}</p>
                        <p><strong>Награда:</strong> {request.reward_points} баллов</p>
                        <p className="status"><strong>Статус:</strong> {request.status}</p>
                        <p className="created-at"><strong>Дата создания:</strong> {new Date(request.created_at).toLocaleString()}</p>

                        {request.status === 'pending' && (
                            <div>
                                <button className="submit-button" onClick={() => updateRequestStatus(request.id, 'approved')}>Одобрить</button>
                                <button className="submit-button" onClick={() => updateRequestStatus(request.id, 'rejected')}>Отклонить</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="container">
            <div className="content">
                <h1>B8oost app failure bruh lmao</h1>

                {/* Переключатель пользователей */}
                <UserSwitcher
                    users={mockUsers}
                    currentUser={currentUser}
                    onUserChange={(user) => setCurrentUser(user)}
                />

                {currentUser ? (
                    <div>
                        <h2>Your Profile</h2>
                        <p>User ID: {currentUser.id}</p>
                        <p>Username: {currentUser.username}</p>
                        <p>First Name: {currentUser.first_name}</p>
                        <p>Role: {currentUser.role}</p>
                    </div>
                ) : (
                    <p>Loading user data...</p>
                )}

                {/* Меню для сотрудника */}
                {currentUser.role === 'employee' && renderEmployeeMenu()}

                {/* Меню для руководителя */}
                {currentUser.role === 'manager' && renderManagerMenu()}
            </div>
        </div>
    );
};

export default App;