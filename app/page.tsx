"use client";
type ApiMarca = { code: string; name: string };
import { useState, useEffect } from 'react';
import Select from '../components/select';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../components/spinner';

interface Marca {
    codigo: string;
    nome: string;
}

interface Modelo {
    codigo: string;
    nome: string;
}

interface Ano {
    codigo: string;
    nome: string;
}

interface DetalhesVeiculo {
    price: string;
    codeFipe: string;
    brand: string;
    model: string;
    modelYear: number;
    fuel: string;
    vehicleType: number;
    fuelAcronym: string;
    referenceMonth: string;
}

export default function ConsultaFipe() {
    const [minimizado, setMinimizado] = useState(false);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [modelosCache, setModelosCache] = useState<Record<string, Modelo[]>>({});
    const [anosCache, setAnosCache] = useState<Record<string, Ano[]>>({});

    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [anos, setAnos] = useState<Ano[]>([]);
    const [detalhes, setDetalhes] = useState<DetalhesVeiculo | null>(null);

    const [marcaSelecionada, setMarcaSelecionada] = useState('');
    const [modeloSelecionado, setModeloSelecionado] = useState('');
    const [anoSelecionado, setAnoSelecionado] = useState('');

    const [erro, setErro] = useState('');

    const [loadingMarcas, setLoadingMarcas] = useState(false);
    const [loadingModelos, setLoadingModelos] = useState(false);
    const [loadingAnos, setLoadingAnos] = useState(false);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);

    useEffect(() => {
        setErro('');
        setLoadingMarcas(true);
                    fetch('https://fipe.parallelum.com.br/api/v2/cars/brands')
                        .then(res => {
                            if (!res.ok) throw new Error('Erro na resposta da API');
                            return res.json();
                        })
                        .then(data => {
                            const marcasFormatadas = (data as ApiMarca[]).map(item => ({ codigo: item.code, nome: item.name }));
                            setMarcas(marcasFormatadas);
                        })
                        .catch(() => setErro('Erro ao carregar marcas'))
                        .finally(() => setLoadingMarcas(false));
  }, []);

    useEffect(() => {
        if (!marcaSelecionada) {
            setModelos([]);
            setModeloSelecionado('');
            return;
        }
        setErro('');
        setModeloSelecionado('');
        setModelos([]);
        setAnoSelecionado('');
        setAnos([]);
        setDetalhes(null);

        if (modelosCache[marcaSelecionada]) {
            setModelos(modelosCache[marcaSelecionada]);
            return;
        }

        setLoadingModelos(true);
        fetch(`https://fipe.parallelum.com.br/api/v2/cars/brands/${marcaSelecionada}/models`)
        .then(res => {
            if (!res.ok) throw new Error('Erro na resposta da API');
            return res.json();
        })
        .then(data => {
            const modelosFormatados = (data as { code: string; name: string }[]).map(item => ({ codigo: item.code, nome: item.name }));
            setModelos(modelosFormatados);
            setModelosCache(prev => ({ ...prev, [marcaSelecionada]: modelosFormatados }));
        })
        .catch(() => setErro('Erro ao carregar modelos'))
        .finally(() => setLoadingModelos(false));
        }, [marcaSelecionada, modelosCache]);

        useEffect(() => {
            if (!marcaSelecionada || !modeloSelecionado) {
                setAnos([]);
                setAnoSelecionado('');
                return;
            }
            setErro('');
            setAnoSelecionado('');
            setAnos([]);
            setDetalhes(null);

            const cacheKey = `${marcaSelecionada}-${modeloSelecionado}`;
            if (anosCache[cacheKey]) {
                setAnos(anosCache[cacheKey]);
                return;
            }

            setLoadingAnos(true);
            fetch(`https://fipe.parallelum.com.br/api/v2/cars/brands/${marcaSelecionada}/models/${modeloSelecionado}/years`)
            .then(res => {
                if (!res.ok) throw new Error('Erro na resposta da API');
                return res.json();
            })
            .then(data => {
                const anosFormatados = (data as { code: string; name: string }[]).map(item => ({ codigo: item.code, nome: item.name }));
                setAnos(anosFormatados);
                setAnosCache(prev => ({ ...prev, [cacheKey]: anosFormatados }));
            })
            .catch(() => setErro('Erro ao carregar anos'))
            .finally(() => setLoadingAnos(false));
        }, [marcaSelecionada, modeloSelecionado, anosCache]);

        useEffect(() => {
            if (!marcaSelecionada || !modeloSelecionado || !anoSelecionado) {
                setDetalhes(null);
                return;
            }
            setErro('');
            setDetalhes(null);
            setLoadingDetalhes(true);

            const detalhesUrl = `https://fipe.parallelum.com.br/api/v2/cars/brands/${marcaSelecionada}/models/${modeloSelecionado}/years/${anoSelecionado}`;
            console.log('URL detalhes FIPE:', detalhesUrl);
            fetch(detalhesUrl)
            .then(res => {
                if (!res.ok) throw new Error('Erro na resposta da API');
                return res.json();
            })
            .then(data => {
                console.log('Resposta detalhes FIPE:', data);
                setDetalhes(data);
            })
            .catch(() => setErro('Erro ao carregar detalhes do veículo'))
            .finally(() => setLoadingDetalhes(false));
        }, [marcaSelecionada, modeloSelecionado, anoSelecionado]);

        const detalhesVisiveis = !loadingDetalhes && detalhes && typeof detalhes === 'object' && Object.keys(detalhes).length > 0 && !('error' in detalhes) && detalhes.price;
        return (
            <div className="max-w-xl mx-auto p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={detalhesVisiveis ? 'detalhes' : 'form'}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className={`relative rounded-2xl border border-gray-200/30 bg-gray-900/60 backdrop-blur-lg shadow-xl p-8 flex flex-col gap-6 ${detalhesVisiveis ? 'mt-0' : 'mt-12'}`}
                        style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}
                    >
                        <h1 className="text-4xl font-extrabold font-sans bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-center mb-8 drop-shadow-lg tracking-wide">
                          Consulta FIPE
                        </h1>
                        {erro && <p className='text-red-500 font-bold mb-6 text-center' role='alert'>{erro}</p>}


                        <div className="grupo-campos">
                          <Select 
                              label="Marca"
                              value={marcaSelecionada}
                              options={marcas}
                              onChange={setMarcaSelecionada}
                              loading={loadingMarcas}
                          />
                          <Select
                              label="Modelo"
                              value={modeloSelecionado}
                              options={modelos}
                              onChange={setModeloSelecionado}
                              disabled={!modelos.length}
                              loading={loadingModelos}
                          />
                          <Select
                              label="Ano"
                              value={anoSelecionado}
                              options={anos}
                              onChange={setAnoSelecionado}
                              disabled={!anos.length}
                              loading={loadingAnos}
                          />
                        </div>

                        {loadingDetalhes && <Spinner />}
                        {detalhesVisiveis && !minimizado && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.98, x: 40 }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                                className="relative rounded-2xl border border-gray-400/40 bg-gray-700/60 backdrop-blur-lg shadow-2xl p-6 mt-4 text-gray-50"
                                style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}
                                role="region"
                                aria-label="Detalhes do veículo"
                            >
                                <div className="absolute top-4 right-4 flex gap-2 z-10">
                                    <button
                                        className="w-7 h-7 flex items-center justify-center rounded bg-gray-900/80 text-gray-200 hover:bg-gray-800/80 hover:text-white transition font-bold shadow"
                                        aria-label="Minimizar"
                                        onClick={() => setMinimizado(true)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="7" width="16" height="2" rx="1" fill="currentColor"/></svg>
                                    </button>
                                    <button
                                        className="w-7 h-7 flex items-center justify-center rounded bg-gray-900/80 text-gray-200 hover:bg-red-600 hover:text-white transition font-bold shadow"
                                        aria-label="Fechar"
                                        onClick={() => {
                                            setMarcaSelecionada('');
                                            setModeloSelecionado('');
                                            setAnoSelecionado('');
                                            setDetalhes(null);
                                            setMinimizado(false);
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="2"/></svg>
                                    </button>
                                </div>
                                <h2 className="titulo-detalhes text-2xl font-bold font-sans bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 drop-shadow-lg tracking-wide">Detalhes do Veículo</h2>
                                <p className='mb-2'><strong>Preço:</strong> {detalhes.price}</p>
                                <p className='mb-2'><strong>Código FIPE:</strong> {detalhes.codeFipe}</p>
                                <p className='mb-2'><strong>Marca:</strong> {detalhes.brand}</p>
                                <p className='mb-2'><strong>Modelo:</strong> {detalhes.model}</p>
                                <p className='mb-2'><strong>Ano Modelo:</strong> {detalhes.modelYear}</p>
                                <p className='mb-2'><strong>Combustível:</strong> {detalhes.fuel}</p>
                                <p className='mb-2'><strong>Tipo Veículo:</strong> {detalhes.vehicleType}</p>
                                <p className='mb-2'><strong>Sigla Combustível:</strong> {detalhes.fuelAcronym}</p>
                                <p className='mb-2'><strong>Mês de Referência:</strong> {detalhes.referenceMonth}</p>
                            </motion.div>
                        )}
                        {detalhesVisiveis && minimizado && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.98, x: -40 }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                                className="flex justify-center mt-4"
                            >
                                <button
                                    className="px-4 py-2 rounded-lg bg-gray-900/80 text-gray-200 hover:bg-blue-600 hover:text-white transition font-bold shadow"
                                    onClick={() => setMinimizado(false)}
                                    aria-label="Maximizar detalhes"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                                </button>
                            </motion.div>
                        )}
                        {!detalhesVisiveis && detalhes && !loadingDetalhes && ((typeof detalhes !== 'object') || Object.keys(detalhes).length === 0 || ('error' in detalhes) || !detalhes.price) ? (
                            <div className='border p-4 rounded bg-gray-50/80 mt-4 text-red-600 font-bold shadow-md' role='alert'>
                                Não há detalhes disponíveis para o veículo selecionado.
                            </div>
                        ) : null}
                    </motion.div>
                </AnimatePresence>
            </div>
        )
    
}