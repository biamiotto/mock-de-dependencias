import { afterEach, describe, expect, it, jest } from '@jest/globals';

jest.unstable_mockModule(
    'axios',
    () => ({
        default: {
            get: jest.fn(),
        },
    }),
    { virtual: true },
);

const axios = (await import('axios')).default;

const { buscarCotacao, BASE_URL } = await import('../src/conversao.js');

describe('Testes do Módulo de Conversão (buscarCotacao)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar a cotação corretamente e verificar a chamada da API (Sucesso)', async () => {
        axios.get.mockResolvedValue({
            data: {
                amount: 1,
                base: 'USD',
                rates: { BRL: 5.25 },
            },
        });

        const chamada = buscarCotacao('USD', 'BRL');

        await expect(chamada).resolves.toBe(5.25);
        expect(axios.get).toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/latest?from=USD&to=BRL`);
    });

    it('deve rejeitar a operação em caso de erro de rede', async () => {
        axios.get.mockRejectedValue(new Error('Erro de rede'));

        const chamada = buscarCotacao('USD', 'BRL');

        await expect(chamada).rejects.toThrow('Erro de rede');
        expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando a resposta da API for incompleta', async () => {
        axios.get.mockResolvedValue({
            data: {
                rates: {},
            },
        });

        const chamada = buscarCotacao('USD', 'EUR');

        await expect(chamada).rejects.toThrow('Cotação indisponível');
        expect(axios.get).toHaveBeenCalledTimes(1);
    });
});