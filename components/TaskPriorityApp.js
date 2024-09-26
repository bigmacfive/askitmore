import React, { useState, useEffect, useRef } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TarotApp = () => {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [concern, setConcern] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);
  const [cardsSpread, setCardsSpread] = useState(false);
  const cardRefs = useRef([]);

  const handleStartReading = () => {
    setStep(2);
  };

  const handleSubmitInfo = () => {
    if (age && concern.length <= 150) {
      setStep(3);
      setCardsSpread(true);
    }
  };

  const handleCardSelection = (index) => {
    if (selectedCards.length < 5 && !selectedCards.includes(index)) {
      const randomCardNumber = Math.floor(Math.random() * 22).toString().padStart(2, '0');
      setSelectedCards([...selectedCards, { index, cardNumber: randomCardNumber }]);
      if (selectedCards.length === 4) {
        setTimeout(() => setStep(4), 500);
      }
    }
  };

  useEffect(() => {
    if (step === 3 && cardsSpread) {
      cardRefs.current.forEach((card, index) => {
        if (card) {
          const delay = Math.random() * 0.5;
          const rotation = (Math.random() - 0.5) * 60;
          const x = (Math.random() - 0.5) * 240;
          const y = (Math.random() - 0.5) * 240;
          card.style.transition = `transform 0.8s ease ${delay}s`;
          card.style.transform = `translate(${x}%, ${y}%) rotate(${rotation}deg)`;
        }
      });
    }
  }, [step, cardsSpread]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white font-neurimbo">
      <style jsx global>{`
        @font-face {
          font-family: 'neurimboGothicRegular';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2304-01@1.0/neurimboGothicRegular.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
        body, html {
          overflow: hidden;
          height: 100%;
        }
        * {
          font-family: 'neurimboGothicRegular', sans-serif;
        }
      `}</style>

      {step === 1 && (
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-4xl mb-12 text-center">타로 점보기</h2>
          <Button
            onClick={handleStartReading}
            className="px-8 py-6 bg-white text-black text-2xl hover:bg-gray-200 border-2 border-black"
          >
            시작하기
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm">
          <h2 className="text-2xl mb-6 text-center">당신에 대해 알려주세요</h2>
          <div className="mb-4">
            <label className="block mb-2 text-sm">나이</label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(Math.min(99, Math.max(1, parseInt(e.target.value) || 0)))}
              className="w-full bg-white text-black"
              min="1"
              max="99"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm">성별</label>
            <div className="flex items-center justify-center bg-white text-black p-2 rounded">
              <span className="mr-2 text-sm">여성</span>
              <Toggle
                pressed={gender === 'male'}
                onPressedChange={() => setGender(gender === 'female' ? 'male' : 'female')}
              >
                {gender === 'female' ? <ToggleLeft /> : <ToggleRight />}
              </Toggle>
              <span className="ml-2 text-sm">남성</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm">고민 (최대 150자)</label>
            <Textarea
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              maxLength={150}
              className="w-full bg-white text-black"
              rows={3}
            />
          </div>
          <Button
            onClick={handleSubmitInfo}
            className="w-full bg-white text-black text-lg hover:bg-gray-200 border-2 border-black"
          >
            입력 완료
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="w-full h-screen relative overflow-hidden">
          <h2 className="text-2xl mb-6 text-center">카드를 선택하세요 (5장)</h2>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            {[...Array(78)].map((_, index) => (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                onClick={() => handleCardSelection(index)}
                className={`absolute w-16 h-24 rounded cursor-pointer transition-all ${
                  selectedCards.some(card => card.index === index)
                    ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50'
                    : 'hover:shadow-md hover:scale-105'
                }`}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img
                  src="/api/placeholder/64/96"
                  alt="Tarot card back"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl mb-6 text-center">당신의 운세</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {selectedCards.map(({ cardNumber }, index) => (
              <div key={index} className="w-1/4 sm:w-1/5 transition-all hover:scale-105">
                <img
                  src={`https://tarot-asset.zikgam.com/img/major/${cardNumber}.jpeg`}
                  alt={`Tarot Card ${index + 1}`}
                  className="w-full rounded shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotApp;