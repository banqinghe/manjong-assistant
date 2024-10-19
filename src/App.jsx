import { useState } from 'react';
import { LoadingOverlay, PasswordInput, TextInput, NativeSelect } from '@mantine/core';
import toast, { Toaster } from 'react-hot-toast';
import OpenAI from 'openai';
import { manjong, models } from './constants';

function Tile({ name, onClick, className = '' }) {
    return (
        <div className={`${className} bg-white`} onClick={onClick}>
            <img className="h-full" src={`/tiles/${name}.png`} alt="name" />
        </div>
    );
}

export default function App() {
    const [currentTiles, setCurrentTiles] = useState([]);
    const [suggestion, setSuggestion] = useState('');
    const [loading, setLoading] = useState(false);

    console.log(JSON.stringify(currentTiles));

    const fetchSuggestion = async ({ apiUrl, apiKey, model }) => {
        const client = new OpenAI({
            baseURL: apiUrl,
            apiKey,
            dangerouslyAllowBrowser: true,
        });
        const completion = await client.chat.completions.create({
            messages: [
                model.startsWith('o1') ? null : { role: 'system', content: '你是一名中国传统麻将高手, 可以为我提供麻将如何出牌的建议' },
                {
                    role: 'assistant',
                    content: `我现在的手牌是 [${currentTiles
                        .map((tile) => tile.name)
                        .join(', ')}], 请告诉我最应该打出哪张牌, 以及后续有什么规划建议, 并给出**简短**有说服力的回答`,
                },
            ].filter(Boolean),
            model,
        });

        return completion.choices[0].message.content;
    };

    const handleAskSuggestion = () => {
        if (loading) {
            return;
        }
        const form = document.getElementById('config');
        const { apiUrl, apiKey, model } = Object.fromEntries(new FormData(form).entries());
        console.log(config);

        if (!apiUrl || !apiKey || !model) {
            toast.error('请填写 API Url, API Key 和模型名称');
            return;
        }

        setLoading(true);
        fetchSuggestion({ apiUrl, apiKey, model })
            .then((suggestion) => setSuggestion(suggestion))
            .catch((err) => {
                console.error(err);
                setSuggestion(err);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="h-screen max-w-[400px] flex flex-col mx-auto">
            <div className="flex flex-col flex-1">
                <form id="config" className="space-y-2 p-4">
                    <label className="flex items-center">
                        <span className="w-16">API Url</span>
                        <TextInput className="flex-1" defaultValue="https://aihubmix.com/v1" name="apiUrl" />
                    </label>
                    <label className="flex items-center">
                        <span className="w-16">API Key</span>
                        <PasswordInput className="flex-1" name="apiKey" defaultValue="" />
                    </label>
                    <label className="flex items-center">
                        <span className="w-16">Model</span>
                        <NativeSelect className="flex-1" name="model" defaultValue="o1-mini" data={models} />
                    </label>
                </form>
                <div className="relative flex-1 px-4 py-2">
                    <LoadingOverlay visible={loading} />
                    <textarea
                        readOnly
                        className="block w-full h-full px-4 py-2 border rounded overflow-y-auto"
                        placeholder="等待高手的回复..."
                        value={suggestion}
                    />
                </div>
            </div>
            <div className="p-4 pb-8 space-y-1">
                {manjong
                    .reduce(
                        (groups, cur) => {
                            const lastGroup = groups[groups.length - 1];
                            if (lastGroup.length === 9) {
                                groups.push([cur]);
                            } else {
                                lastGroup.push(cur);
                            }
                            return groups;
                        },
                        [[]],
                    )
                    .map((group, groupIdx) => (
                        <div key={groupIdx} className="grid grid-cols-9 gap-0.5">
                            {group.map((tile, idx) => (
                                <Tile
                                    key={idx}
                                    name={tile.name}
                                    // className="flex-1"
                                    onClick={() => {
                                        if (currentTiles.length === 13) {
                                            return;
                                        }
                                        setCurrentTiles((tiles) => {
                                            return [...tiles, tile].sort((a, b) => a.order - b.order);
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    ))}
            </div>
            <div className="flex justify-center gap-2">
                <button
                    className={`w-48 py-2 bg-slate-50 rounded-full ${currentTiles.length > 3 ? '' : 'text-opacity-60'}`}
                    onClick={handleAskSuggestion}
                >
                    {currentTiles.length > 3 ? '💡出牌建议' : '选牌中...'}
                </button>
            </div>
            <div className="grid grid-cols-7 min-h-24 gap-1 p-4 mt-2 bg-slate-50">
                {currentTiles.map((tile, idx) => (
                    <Tile
                        key={idx}
                        name={tile.name}
                        onClick={() => {
                            setCurrentTiles((tiles) => {
                                const newTiles = [...tiles];
                                newTiles.splice(idx, 1);
                                return newTiles;
                            });
                        }}
                    />
                ))}
            </div>
            <Toaster />
        </div>
    );
}
