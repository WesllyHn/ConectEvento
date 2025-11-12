import { ArrowLeft, Calendar, MapPin, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  budget: string;
  status: string;
}

interface EventHeaderProps {
  event: Event;
  completionPercentage: number;
}

export function EventHeader({ event, completionPercentage }: EventHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-label="back-arrow" />
        <span className="font-medium">Voltar ao Dashboard</span>
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-blue-600" aria-label='calendar' />
                <span className="font-medium">{new Date(event.date).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5 text-blue-600" aria-label='location' />
                <span className="font-medium">{event.location}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-5 h-5 text-blue-600" aria-label='budget'/>
                <span className="font-medium">{event.budget}</span>
              </div>
            </div>
          </div>


          <div className="text-center">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                  className="text-blue-600 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{completionPercentage}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">Contratado</p>
          </div>
        </div>
      </div>
    </>
  );
}
