import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [showResetForm, setShowResetForm] = useState(false);
    const { signIn, resetPassword } = useAuth();
    const navigate = useNavigate();

    // Validação de email
    const validateEmail = (email: string): boolean => {
        return /\S+@\S+\.\S+/.test(email);
    };

    // Validação de senha
    const validatePassword = (password: string): boolean => {
        return password.length >= 6;
    };

    // Limpar erros ao digitar
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError('');
        if (resetMessage) setResetMessage('');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError('');
    };

    // Validação client-side
    const validateForm = (): boolean => {
        if (!email.trim()) {
            setError('Email é obrigatório.');
            return false;
        }

        if (!validateEmail(email)) {
            setError('Por favor, insira um email válido.');
            return false;
        }

        if (!password.trim()) {
            setError('Senha é obrigatória.');
            return false;
        }

        if (!validatePassword(password)) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/home');
        } catch (error: any) {
            let errorMsg = 'Erro ao fazer login. Verifique suas credenciais.';
            if (error && error.message) {
                if (error.message.includes('auth/user-not-found')) {
                    errorMsg = 'Usuário não encontrado. Verifique o email ou cadastre-se.';
                } else if (error.message.includes('auth/wrong-password')) {
                    errorMsg = 'Senha incorreta. Tente novamente.';
                } else if (error.message.includes('auth/invalid-email')) {
                    errorMsg = 'Email inválido.';
                } else if (error.message.includes('auth/too-many-requests')) {
                    errorMsg = 'Muitas tentativas. Tente novamente mais tarde.';
                } else if (error.message.includes('auth/user-disabled')) {
                    errorMsg = 'Esta conta foi desabilitada. Entre em contato com o suporte.';
                } else if (error.message.includes('auth/invalid-credential')) {
                    errorMsg = 'Credenciais inválidas. Verifique email e senha.';
                } else {
                    errorMsg = error.message;
                }
            }
            setError(errorMsg);
            console.error('Erro no login:', error);
        } finally {
            setLoading(false);
        }
    };

    // Função para reset de senha
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResetMessage('');

        if (!email.trim()) {
            setError('Digite seu email para redefinir a senha.');
            return;
        }

        if (!validateEmail(email)) {
            setError('Por favor, insira um email válido.');
            return;
        }

        setResetLoading(true);

        try {
            await resetPassword(email);
            setResetMessage('Email de redefinição enviado! Verifique sua caixa de entrada.');
            setShowResetForm(false);
        } catch (error: any) {
            let errorMsg = 'Erro ao enviar email de redefinição.';
            if (error && error.message) {
                if (error.message.includes('auth/user-not-found')) {
                    errorMsg = 'Email não encontrado. Verifique o endereço digitado.';
                } else if (error.message.includes('auth/invalid-email')) {
                    errorMsg = 'Email inválido.';
                } else if (error.message.includes('auth/too-many-requests')) {
                    errorMsg = 'Muitas tentativas. Aguarde antes de tentar novamente.';
                } else {
                    errorMsg = error.message;
                }
            }
            setError(errorMsg);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className="mx-auto w-20 h-20 flex items-center justify-center">
                        <svg
                            className="w-full h-full"
                            version="1.1"
                            id="Layer_1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            x="0px"
                            y="0px"
                            viewBox="0 0 512 512"
                            enableBackground="new 0 0 512 512"
                            xmlSpace="preserve"
                        >
                            <path fill="#fff" opacity="1.000000" stroke="none"
                                d="
M302.603668,176.508240 
	C319.896423,182.561234 336.840881,188.431549 353.778778,194.320847 
	C358.626221,196.006302 362.265137,198.430222 362.255768,204.505936 
	C362.246704,210.396622 359.089966,213.148483 354.140472,214.990601 
	C345.272278,218.291199 336.501984,221.858200 327.603058,225.070892 
	C324.814270,226.077682 323.870209,227.462921 323.916199,230.444412 
	C324.098541,242.266586 323.621857,254.108978 324.124634,265.912567 
	C324.445068,273.434753 321.336639,278.643738 315.807587,282.982666 
	C305.750763,290.874756 294.088318,295.228973 281.716522,297.427704 
	C254.218399,302.314636 226.751221,302.573242 199.606689,295.001434 
	C190.551941,292.475677 182.162781,288.497925 175.587250,281.446381 
	C172.040848,277.643250 170.159805,273.297943 170.234055,267.940094 
	C170.407135,255.451294 170.198898,242.957336 170.358109,230.468170 
	C170.393692,227.676392 169.511459,226.334518 166.912888,225.367432 
	C157.889267,222.009247 148.938751,218.452362 139.987701,214.902252 
	C133.790497,212.444351 131.932312,209.781494 131.966873,204.303696 
	C132.002563,198.645935 135.530792,196.091522 140.249451,194.416718 
	C173.733582,182.532257 207.173889,170.521408 240.753616,158.913727 
	C244.205963,157.720352 248.778214,158.000839 252.326477,159.151993 
	C269.064850,164.582291 285.627563,170.554092 302.603668,176.508240 
M205.042664,229.491165 
	C217.557846,234.404022 230.027893,239.438507 242.630997,244.114365 
	C244.824295,244.928055 247.853790,244.950058 250.033096,244.119843 
	C282.452179,231.769333 314.794739,219.217850 347.146606,206.691269 
	C348.472351,206.177963 349.712341,205.443161 351.536011,204.543243 
	C316.829376,192.451324 282.825134,180.567123 248.766464,168.840973 
	C246.954239,168.217026 244.521362,168.454208 242.651169,169.092575 
	C230.242172,173.328384 217.901917,177.766403 205.550674,182.170532 
	C184.836319,189.556732 164.130463,196.966736 142.290131,204.770813 
	C163.650589,213.167007 183.995636,221.164078 205.042664,229.491165 
M224.443008,247.988968 
	C210.027863,242.350708 195.612717,236.712448 180.703125,230.880798 
	C180.703125,243.538544 180.840790,255.358856 180.628281,267.172882 
	C180.554138,271.293915 181.888596,274.628418 185.262527,276.470917 
	C191.625626,279.945801 197.994370,283.985382 204.885178,285.813660 
	C227.745514,291.878876 251.056854,291.456116 274.303131,288.231567 
	C286.388458,286.555237 298.134491,283.302948 308.121796,275.846436 
	C310.487701,274.080048 313.424011,271.137878 313.536926,268.621643 
	C314.094025,256.205566 313.790375,243.750900 313.790375,230.761658 
	C311.744751,231.452438 310.200043,231.911438 308.701416,232.489914 
	C294.756226,237.872864 280.386414,242.389145 266.997833,248.916763 
	C252.867447,255.806030 239.678955,256.748596 226.082016,248.658493 
	C225.796768,248.488770 225.484650,248.364227 224.443008,247.988968 
z"/>
                        </svg>
                    </div>
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-100">
                        {showResetForm ? 'Redefinir Senha' : 'Entre com a sua conta'}
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {resetMessage && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {resetMessage}
                        </div>
                    )}

                    {showResetForm ? (
                        // Formulário de Reset de Senha
                        <form onSubmit={handleForgotPassword} className="space-y-6" noValidate>
                            <div>
                                <label htmlFor="reset-email" className="block text-sm/6 font-medium text-gray-100">
                                    Email
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="reset-email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="Digite seu email"
                                        className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                                        aria-describedby="reset-email-description"
                                    />
                                </div>
                                <p id="reset-email-description" className="mt-1 text-xs text-gray-400">
                                    Enviaremos um link para redefinir sua senha
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resetLoading ? 'Enviando...' : 'Enviar Email de Redefinição'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResetForm(false);
                                        setError('');
                                        setResetMessage('');
                                    }}
                                    className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-semibold"
                                >
                                    Voltar ao Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Formulário de Login
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div>
                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
                                    Email
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="Digite seu email"
                                        className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                                        aria-describedby="email-error"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
                                        Senha
                                    </label>
                                    <div className="text-sm">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowResetForm(true);
                                                setError('');
                                            }}
                                            className="font-semibold text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                                        >
                                            Esqueci minha senha
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        placeholder="Digite sua senha (mín. 6 caracteres)"
                                        className="block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-gray-100 outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                                        aria-describedby="password-error"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </button>


                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}