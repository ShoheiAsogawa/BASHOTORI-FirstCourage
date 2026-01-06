// 位置情報取得ユーティリティ

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('位置情報がサポートされていません'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = '位置情報の取得に失敗しました';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の使用が許可されていません';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません';
            break;
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5分間キャッシュ
      }
    );
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // 逆ジオコーディング（緯度経度から住所を取得）
    // 無料のNominatim APIを使用（OpenStreetMap）
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BASHOTORI-App/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('逆ジオコーディングに失敗しました');
    }

    const data = await response.json();
    const address = data.address;
    
    if (address) {
      // 日本の住所形式で返す
      const parts: string[] = [];
      if (address.state) parts.push(address.state); // 都道府県
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village); // 市区町村
      }
      return parts.join('');
    }

    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

