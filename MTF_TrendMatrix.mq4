//+------------------------------------------------------------------+
//|                                                MTF_TrendMatrix.mq4
//| Painel MTF + setas/alerta + assertividade (Binary/Forex)
//| + Linhas verticais de sincronização para subjanela
//+------------------------------------------------------------------+
#property strict
#property indicator_chart_window
#property indicator_buffers 2
#property indicator_color1  clrLime
#property indicator_color2  clrTomato
#property indicator_width1  2
#property indicator_width2  2

// --- Parâmetros de Envio para API ---
extern string   ApiUrl              = "https://sinaismt4.vercel.app/api/snapshot";

// --- Parâmetros do Indicador ---
extern string   TimeframesCSV       = "M1,M5,M15,M30,H1";

extern bool    UseMAVotes          = true;
extern int     MAPeriodFast        = 20;
extern int     MAPeriodMid         = 50;
extern int     MAPeriodSlow        = 100;

extern bool    UseCCI              = true;   extern int CCI_Period = 14;
extern bool    UseMACD             = true;   extern int MACD_Fast=12, MACD_Slow=26, MACD_Signal=9;
extern bool    UseADX              = true;   extern int ADX_Period = 14;  extern int ADX_Min=20;
extern bool    UseStoch            = false;  extern int K=14, D=3, Slowing=3; extern int StochOB=80, StochOS=20;

extern int     MinScore            = 4;
extern bool    OnlyOnBarClose      = true;
extern bool    EnableAlerts        = true;
extern bool    PushNotification    = false;
extern bool    EmailAlert          = false;

extern int     EvaluateLastBars    = 200;
extern double  TestTP_Pips         = 60;
extern double  TestSL_Pips         = 25;
extern int     MaxBarsOutcome      = 20;

extern bool    UseBinaryEval       = true;
extern int     ExpiryCandles       = 5;
extern bool    EntryOnBarClose     = true;

extern bool    FilterMarketOpen    = true;
extern int     AllowStartHour      = 0;
extern int     AllowEndHour        = 23;

extern int     Corner              = 1;
extern int     X                   = 10;
extern int     Y                   = 20;
extern int     CellW               = 60;
extern int     RowH                = 16;
extern color   UpColor             = clrLime;
extern color   DownColor           = clrTomato;
extern color   NeutralColor        = clrSilver;
extern color   PanelText           = clrWhite;
extern color   PanelTitle          = clrDeepSkyBlue;

extern bool    DrawSyncLines       = true;
extern color   SyncBuyColor        = clrAqua;
extern color   SyncSellColor       = clrMagenta;
extern int     SyncStyle           = STYLE_DOT;

double BuyBuf[], SellBuf[];
double pips2points=1.0, pip=0.0001;

#define MAX_TF 8
int TFs[MAX_TF]; int nTF=0;
datetime lastAlertBar=0;
datetime lastSentBarTime=0; // Controla o envio para a API

//+------------------------------------------------------------------+
//| Funções de Envio para API
//+------------------------------------------------------------------+
string SignalToString(int sig){
   if(sig == 1) return "BUY";
   if(sig == -1) return "SELL";
   return "NONE";
}

string PeriodToString(int tf){
   switch(tf){
      case PERIOD_M1: return "M1";
      case PERIOD_M5: return "M5";
      case PERIOD_M15: return "M15";
      case PERIOD_M30: return "M30";
      case PERIOD_H1: return "H1";
      case PERIOD_H4: return "H4";
      case PERIOD_D1: return "D1";
      case PERIOD_W1: return "W1";
      case PERIOD_MN1: return "MN";
   }
   return "";
}

// Converte um booleano para string "true" ou "false" para o JSON
string BoolToString(bool b) {
    return(b ? "true" : "false");
}

void PostSnapshot(string payload){
    string result_headers;
    char post[], result[];
    int timeout=5000;

    // Converte o payload string para um array de char
    int payload_len = StringToCharArray(payload, post, 0, WHOLE_ARRAY, CP_UTF8);

    // Limpa o objeto de erro
    ResetLastError();

    // Faz a requisição
    int res = WebRequest("POST", ApiUrl, "Content-Type: application/json\r\n", NULL, timeout, post, payload_len, result, result_headers);

    if(res == -1){
        Print("Erro no WebRequest: ", GetLastError());
    } else {
        // Sucesso
        // Print("Snapshot enviado com sucesso. Resposta: ", CharArrayToString(result));
    }
}


//+------------------------------------------------------------------+
//| Funções do Indicador
//+------------------------------------------------------------------+
void InitPipMath(string s){
   int d=(int)MarketInfo(s,MODE_DIGITS);
   pips2points=(d==3 || d==5)?10.0:1.0;
   pip=MarketInfo(s,MODE_POINT)*pips2points;
}

int TFByToken(string t){
   if (StringCompare(t,"M1")==0)   return PERIOD_M1;
   if (StringCompare(t,"M5")==0)   return PERIOD_M5;
   if (StringCompare(t,"M15")==0)  return PERIOD_M15;
   if (StringCompare(t,"M30")==0)  return PERIOD_M30;
   if (StringCompare(t,"H1")==0)   return PERIOD_H1;
   if (StringCompare(t,"H4")==0)   return PERIOD_H4;
   if (StringCompare(t,"D1")==0)   return PERIOD_D1;
   if (StringCompare(t,"W1")==0)   return PERIOD_W1;
   if (StringCompare(t,"MN")==0)   return PERIOD_MN1;
   return 0;
}

void ParseTFs(){
   nTF=0; string s=TimeframesCSV; int p=0;
   while(nTF<MAX_TF){
      int c=StringFind(s,",",p);
      string tok=(c<0)?StringSubstr(s,p):StringSubstr(s,p,c-p);
      int tf=TFByToken(tok);
      if(tf>0) TFs[nTF++]=tf;
      if(c<0) break; p=c+1;
   }
}

void PutLabel(string name,string text,int cx,int cy,color col,int size=9){
   if(ObjectFind(0,name)<0) ObjectCreate(0,name,OBJ_LABEL,0,0,0);
   ObjectSetInteger(0,name,OBJPROP_CORNER,Corner);
   ObjectSetInteger(0,name,OBJPROP_XDISTANCE,cx);
   ObjectSetInteger(0,name,OBJPROP_YDISTANCE,cy);
   ObjectSetInteger(0,name,OBJPROP_FONTSIZE,size);
   ObjectSetInteger(0,name,OBJPROP_COLOR,col);
   ObjectSetString (0,name,OBJPROP_TEXT,text);
}
string NewId(int &idx){ string s="MTFM_"+IntegerToString(idx); idx++; return s; }

bool IsMarketOpen(){
   if(!FilterMarketOpen) return true;
   datetime now=TimeCurrent();
   int dow=TimeDayOfWeek(now);
   if(dow==0 || dow==6) return false;
   int h=TimeHour(now);
   if(AllowStartHour==AllowEndHour) return true;
   if(AllowStartHour<AllowEndHour)  return (h>=AllowStartHour && h<=AllowEndHour);
   return (h>=AllowStartHour || h<=AllowEndHour);
}

int VotesForTF(string sym,int tf,int shift){
   int votes=0;
   if(UseMAVotes){
      double maF=iMA(sym,tf,MAPeriodFast,0,MODE_SMA,PRICE_CLOSE,shift);
      double maM=iMA(sym,tf,MAPeriodMid ,0,MODE_SMA,PRICE_CLOSE,shift);
      double maS=iMA(sym,tf,MAPeriodSlow,0,MODE_SMA,PRICE_CLOSE,shift);
      double px =iClose(sym,tf,shift);
      if(maF>maM && maM>maS) votes++;
      else if(maF<maM && maM<maS) votes--;
      else { if(px>maS) votes++; else if(px<maS) votes--; }
   }
   if(UseCCI){
      double cci=iCCI(sym,tf,CCI_Period,PRICE_TYPICAL,shift);
      if(cci>0) votes++; else if(cci<0) votes--;
   }
   if(UseMACD){
      double macd=iMACD(sym,tf,MACD_Fast,MACD_Slow,MACD_Signal,PRICE_CLOSE,MODE_MAIN,shift);
      if(macd>0) votes++; else if(macd<0) votes--;
   }
   if(UseADX){
      double adx=iADX(sym,tf,ADX_Period,PRICE_CLOSE,MODE_MAIN,shift);
      double pdi=iADX(sym,tf,ADX_Period,PRICE_CLOSE,MODE_PLUSDI,shift);
      double ndi=iADX(sym,tf,ADX_Period,PRICE_CLOSE,MODE_MINUSDI,shift);
      if(adx>=ADX_Min){
         if(pdi>ndi) votes++; else if(ndi>pdi) votes--;
      }
   }
   if(UseStoch){
      double ks=iStochastic(sym,tf,K,D,Slowing,MODE_SMA,0,MODE_MAIN,shift);
      double ds=iStochastic(sym,tf,K,D,Slowing,MODE_SMA,0,MODE_SIGNAL,shift);
      if(ks>ds && ks>StochOS && ds>StochOS) votes++;
      else if(ks<ds && ks<StochOB && ds<StochOB) votes--;
   }
   return votes;
}

int FinalVotesTF(int shift){ return VotesForTF(Symbol(),Period(),shift); }
int FinalSignal(int shift){
   int v=FinalVotesTF(shift);
   if(v>=MinScore)  return 1;
   if(v<=-MinScore) return -1;
   return 0;
}

int Outcome_Forex(int dir,int shift){
   double price=iClose(NULL,0,shift);
   double tp=(dir==1)? price+TestTP_Pips*pip : price-TestTP_Pips*pip;
   double sl=(dir==1)? price-TestSL_Pips*pip : price+TestSL_Pips*pip;
   for(int k=shift-1;k>=MathMax(0,shift-MaxBarsOutcome);k--){
      double hi=iHigh(NULL,0,k), lo=iLow(NULL,0,k);
      if(dir==1){ if(hi>=tp) return 1; if(lo<=sl) return -1; }
      else      { if(lo<=tp) return 1; if(hi>=sl) return -1; }
   }
   return 0;
}

int Outcome_Binary(int dir, int shift){
   int expShift=shift-ExpiryCandles;
   if(expShift<0) return 0;
   double entry = EntryOnBarClose ? iClose(NULL,0,shift) : iOpen(NULL,0,shift-1);
   double expiryClose=iClose(NULL,0,expShift);
   if(dir==1)  return (expiryClose>entry)?1:-1;
   else        return (expiryClose<entry)?1:-1;
}

int init(){
   SetIndexBuffer(0,BuyBuf);  SetIndexStyle(0,DRAW_ARROW,STYLE_SOLID,2); SetIndexArrow(0,233);
   SetIndexBuffer(1,SellBuf); SetIndexStyle(1,DRAW_ARROW,STYLE_SOLID,2); SetIndexArrow(1,234);
   ArrayInitialize(BuyBuf,EMPTY_VALUE); ArrayInitialize(SellBuf,EMPTY_VALUE);
   InitPipMath(Symbol()); ParseTFs();
   IndicatorShortName("MTF Trend Matrix");
   return(0);
}

int deinit(){
   for(int i=0;i<2000;i++){ string nm="MTFM_"+IntegerToString(i); ObjectDelete(0,nm); }
   return(0);
}

void SyncVLine(datetime t, bool buy){
   if(!DrawSyncLines) return;
   string nm = "MTFM_sync_"+IntegerToString((int)t);
   if(ObjectFind(0,nm)<0){
      ObjectCreate(0,nm,OBJ_VLINE,0,t,0);
      ObjectSetInteger(0,nm,OBJPROP_COLOR, buy?SyncBuyColor:SyncSellColor);
      ObjectSetInteger(0,nm,OBJPROP_STYLE, SyncStyle);
      ObjectSetInteger(0,nm,OBJPROP_WIDTH, 1);
   }
}

int start(){
   ArrayInitialize(BuyBuf,EMPTY_VALUE); ArrayInitialize(SellBuf,EMPTY_VALUE);

   int idx=0, x0=X, y0=Y;

   PutLabel(NewId(idx),"MTF Trend Matrix", x0, y0, PanelTitle, 10);

   int cy=y0+RowH;
   PutLabel(NewId(idx),"Indicador", x0, cy, PanelText);
   for(int j=0;j<nTF;j++){
      string cap="TF";
      switch(TFs[j]){
         case PERIOD_M1:  cap="M1";  break; case PERIOD_M5:  cap="M5";  break;
         case PERIOD_M15: cap="M15"; break; case PERIOD_M30: cap="M30"; break;
         case PERIOD_H1:  cap="H1";  break; case PERIOD_H4:  cap="H4";  break;
         case PERIOD_D1:  cap="D1";  break; case PERIOD_W1:  cap="W1";  break;
         case PERIOD_MN1: cap="MN";  break;
      }
      PutLabel(NewId(idx),cap, x0+(j+1)*CellW, cy, PanelText);
   }

   string feats[5]; int nf=0;
   if(UseMAVotes) feats[nf++]="MA20/50/100";
   if(UseCCI)      feats[nf++]="CCI14";
   if(UseMACD)     feats[nf++]="MACD";
   if(UseADX)      feats[nf++]="ADX14";
   if(UseStoch)    feats[nf++]="Stoch";

   for(int r=0;r<nf;r++){
      int ry=y0+(r+2)*RowH;
      PutLabel(NewId(idx),feats[r], x0, ry, PanelText);
      for(int j=0;j<nTF;j++){
         int v=VotesForTF(Symbol(),TFs[j],0);
         color c=(v>0?UpColor:(v<0?DownColor:NeutralColor));
         string t=(v>0?"UP":(v<0?"DOWN":"NEUTRO"));
         PutLabel(NewId(idx),t, x0+(j+1)*CellW, ry, c);
      }
   }

   // seta/sinal na vela fechada
   int sig=FinalSignal(1);
   double price=iClose(NULL,0,1);
   if(sig==1){  BuyBuf[1]=price-2*pip;  SyncVLine(Time[1], true);  }
   if(sig==-1){ SellBuf[1]=price+2*pip; SyncVLine(Time[1], false); }

   // alertas
   if(EnableAlerts && IsMarketOpen()){
      bool can = (OnlyOnBarClose ? (Time[1]!=lastAlertBar && sig!=0) : (sig!=0));
      if(can){
         string m="Matrix "+Symbol()+": "+(sig==1?"BUY":"SELL")+
                  " (score >= "+IntegerToString(MinScore)+") @ "+DoubleToString(price,Digits);
         Alert(m);
         if(PushNotification) SendNotification(m);
         if(EmailAlert)       SendMail("Matrix", m);
         lastAlertBar=Time[1];
      }
   }

   // assertividade
   int total=0,wins=0,loss=0,undef=0;
   int minBarsNeed = UseBinaryEval ? (ExpiryCandles+2) : 3;
   int N = MathMin(EvaluateLastBars, Bars - minBarsNeed);
   if(N < 1) N = 1;

   for(int b=1; b<=N; b++){
      int s = FinalSignal(b);
      if(s==0) continue;
      total++;
      int out = UseBinaryEval ? Outcome_Binary(s,b) : Outcome_Forex(s,b);
      if(out>0) wins++; else if(out<0) loss++; else undef++;
   }

   double wr=(total>0)?100.0*wins/total:0.0;

   string line1="Amostra:"+IntegerToString(N)+
                "  Sinais:"+IntegerToString(total)+
                "  Wins:"+IntegerToString(wins)+
                "  Loss:"+IntegerToString(loss)+
                "  Indef:"+IntegerToString(undef);

   string line2;
   if(UseBinaryEval){
      line2="Assertividade BINÁRIAS (Exp "+IntegerToString(ExpiryCandles)+" velas): "+
            DoubleToString(wr,1)+"% ITM";
   }else{
      line2="Assertividade (TP "+DoubleToString(TestTP_Pips,0)+
            " / SL "+DoubleToString(TestSL_Pips,0)+
            " / MaxBars "+IntegerToString(MaxBarsOutcome)+
            "): "+DoubleToString(wr,1)+"%";
   }

   PutLabel(NewId(idx), line1, x0, y0+(nf+3)*RowH, PanelText);
   PutLabel(NewId(idx), line2, x0, y0+(nf+4)*RowH, (wr>=50?clrDeepSkyBlue:DownColor));

   string mkt = IsMarketOpen() ? "Mercado: ABERTO" : "Mercado: FECHADO";
   PutLabel(NewId(idx), mkt, x0, y0+(nf+5)*RowH, IsMarketOpen()?UpColor:DownColor);

   // --- Envio para a API ---
    if(Time[0] != lastSentBarTime){
        lastSentBarTime = Time[0];

        // Monta o payload JSON
        string payload = StringFormat(
            "{\"symbol\":\"%s\", \"tf\":\"%s\", \"winrate\":%.1f, \"sample\":%d, \"lastSignal\":\"%s\", \"expiry\":%d, \"serverTime\":%d, \"isMarketOpen\":%s, \"spread\":%d, \"notes\":\"%s\", \"onlyOnBarClose\":%s}",
            Symbol(),
            PeriodToString(Period()),
            wr,
            total,
            SignalToString(FinalSignal(1)),
            ExpiryCandles,
            TimeCurrent(), // Usando TimeCurrent() para o tempo do servidor MT4
            BoolToString(IsMarketOpen()),
            (int)MarketInfo(Symbol(), MODE_SPREAD),
            "MA20/50/100 alinhadas; MACD<0; RSI<50", // Nota de exemplo
            BoolToString(EntryOnBarClose)
        );

        PostSnapshot(payload);
    }
    
   return(0);
}
//+------------------------------------------------------------------+