import io
import json
from datetime import datetime
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        # Footer text
        self.drawString(54, 30, "CREDIT ASSISTANT | Confidential Financial Health Analysis")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 30, page_str)
        self.restoreState()

def generate_pdf_report(user_name: str, email: str, report_data: Dict[str, Any]) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom styles
    brand_style = ParagraphStyle(
        'BrandTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1E3A8A') # Deep Blue
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569')
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155')
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748B')
    )

    elements = []

    # 1. Header & Branding
    elements.append(Paragraph("CREDIT ASSISTANT", brand_style))
    elements.append(Paragraph("AI-Powered Credit Health & Financial Wellness Report", subtitle_style))
    elements.append(Spacer(1, 10))

    # Meta Table
    gen_date = datetime.now().strftime("%d %B %Y, %I:%M %p")
    meta_data = [
        [
            Paragraph(f"<b>Client Name:</b> {user_name}", body_style),
            Paragraph(f"<b>Email:</b> {email}", body_style)
        ],
        [
            Paragraph(f"<b>Generated On:</b> {gen_date}", body_style),
            Paragraph(f"<b>Framework:</b> Indian Banking & CIBIL Standard", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    # 2. Executive Credit Overview Card
    elements.append(Paragraph("1. Executive Credit Overview", heading_style))
    
    score = report_data.get("current_credit_score", 735)
    health_score = report_data.get("financial_health_score", 78)
    health_status = report_data.get("health_status", "Good")
    score_change = report_data.get("score_delta", "+0")

    summary_boxes = [
        [
            Paragraph(f"<b>Current Credit Score</b><br/><font size='16' color='#2563EB'><b>{score}</b></font><br/><font size='8' color='#16A34A'>CIBIL Scale (300-900)</font>", body_style),
            Paragraph(f"<b>Financial Health Score</b><br/><font size='16' color='#059669'><b>{health_score}/100</b></font><br/><font size='8' color='#475569'>Status: <b>{health_status}</b></font>", body_style),
            Paragraph(f"<b>Score Improvement</b><br/><font size='16' color='#4F46E5'><b>{score_change}</b></font><br/><font size='8' color='#64748B'>Since tracking start</font>", body_style),
        ]
    ]
    summary_table = Table(summary_boxes, colWidths=[173, 173, 174])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#BFDBFE')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#DBEAFE')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 12))

    # 3. Financial Metrics Breakdown
    elements.append(Paragraph("2. Financial Profile & Ratios", heading_style))
    
    income = report_data.get("monthly_income", 0.0)
    expenses = report_data.get("monthly_expenses", 0.0)
    debt = report_data.get("total_debt", 0.0)
    limit = report_data.get("credit_limit", 0.0)
    utilization = report_data.get("credit_utilization", 0.0)
    dti = report_data.get("dti_ratio", 0.0)
    loans = report_data.get("active_loans", 0)
    missed = report_data.get("missed_payments", 0)

    metrics_rows = [
        ["Financial Parameter", "Reported Value", "Optimal Benchmark", "Status Assessment"],
        ["Monthly Gross Income", f"INR {income:,.2f}", "-", "Verified Baseline"],
        ["Monthly Obligations / Expenses", f"INR {expenses:,.2f}", "< 50% of Income", "Balanced Cashflow" if expenses <= (income * 0.5) else "Elevated"],
        ["Total Outstanding Debt", f"INR {debt:,.2f}", "-", "Active Liability"],
        ["Total Credit Facility Limit", f"INR {limit:,.2f}", "-", "Available Ceiling"],
        ["Credit Utilization Ratio", f"{utilization:.1f}%", "<= 30.0%", "Optimal" if utilization <= 30 else ("Moderate" if utilization <= 50 else "High Risk")],
        ["Debt-to-Income (DTI) Ratio", f"{dti:.1f}%", "<= 35.0%", "Healthy" if dti <= 35 else ("Manageable" if dti <= 50 else "High Risk")],
        ["Active Loan Facilities", str(loans), "1 - 3 Diversified", "Standard Portfolio"],
        ["Missed Payments (24 Months)", str(missed), "0 Defaults", "Clean Track Record" if missed == 0 else f"{missed} Default(s) Recorded"],
    ]

    metrics_table = Table(metrics_rows, colWidths=[150, 120, 110, 140])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    elements.append(metrics_table)
    elements.append(Spacer(1, 12))

    # 4. Score History Snapshot
    score_history = report_data.get("score_history", [])
    if score_history:
        elements.append(Paragraph("3. Credit Score Progression History", heading_style))
        hist_rows = [["Recorded Date", "Score Level", "Bureau Standing", "Progress Note"]]
        for item in score_history[-6:]:
            s_val = item.get("credit_score", 0)
            date_val = item.get("recorded_at", "")[:10]
            status_val = "Excellent" if s_val >= 750 else ("Good" if s_val >= 700 else "Fair")
            note_val = item.get("note", "Periodic update")
            hist_rows.append([date_val, str(s_val), status_val, note_val])
        
        hist_table = Table(hist_rows, colWidths=[120, 100, 120, 180])
        hist_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8.5),
            ('PADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        elements.append(hist_table)
        elements.append(Spacer(1, 12))

    # 5. AI Financial Analysis & Bottlenecks
    elements.append(Paragraph("4. AI Credit Health Consultation & Analysis", heading_style))
    ai_data = report_data.get("ai_advice", {})
    summary_text = ai_data.get("summary", "Credit standing is in healthy standing with clear pathways to 780+ CIBIL.")
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 6))

    analysis_text = ai_data.get("credit_health_analysis", "")
    if analysis_text:
        elements.append(Paragraph(analysis_text, body_style))
        elements.append(Spacer(1, 6))

    # Risks & Bottlenecks
    risks = ai_data.get("key_risks", [])
    bottlenecks = ai_data.get("bottlenecks", [])
    
    rb_data = [
        [Paragraph("<b>Key Risk Factors</b>", body_style), Paragraph("<b>Financial Bottlenecks</b>", body_style)]
    ]
    max_items = max(len(risks), len(bottlenecks), 1)
    for i in range(max_items):
        r_item = f"• {risks[i]}" if i < len(risks) else ""
        b_item = f"• {bottlenecks[i]}" if i < len(bottlenecks) else ""
        rb_data.append([Paragraph(r_item, body_style), Paragraph(b_item, body_style)])

    rb_table = Table(rb_data, colWidths=[260, 260])
    rb_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FEF2F2')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#FCA5A5')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#FEE2E2')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(rb_table)
    elements.append(Spacer(1, 12))

    # 6. Five-Step Improvement Roadmap
    elements.append(Paragraph("5. Five-Step Credit Improvement Roadmap", heading_style))
    five_step = ai_data.get("five_step_plan", [])
    
    plan_rows = [["Step", "Focus Action", "Tactical Execution Plan", "Target Timeline"]]
    for item in five_step:
        st_num = f"Step {item.get('step', '-')}"
        st_title = item.get('title', '')
        st_desc = item.get('description', '')
        st_time = item.get('timeline', '')
        plan_rows.append([
            Paragraph(f"<b>{st_num}</b>", body_style),
            Paragraph(f"<b>{st_title}</b>", body_style),
            Paragraph(st_desc, body_style),
            Paragraph(st_time, body_style)
        ])

    plan_table = Table(plan_rows, colWidths=[55, 140, 225, 100])
    plan_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F0FDF4')]),
    ]))
    elements.append(plan_table)
    elements.append(Spacer(1, 14))

    # 7. Regulatory Disclaimer
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=8))
    disclaimer_text = (
        "<b>REGULATORY DISCLAIMER:</b> This Financial Health Report is generated for educational and informational "
        "purposes only and does not constitute financial, credit, lending, or investment advice. Credit scores and bureau metrics "
        "are indicative and may vary based on independent bureau records (TransUnion CIBIL, Experian, Equifax, CRIF High Mark). "
        "Always consult with certified financial advisors or credit institutions before entering into lending commitments."
    )
    elements.append(Paragraph(disclaimer_text, disclaimer_style))

    # Build PDF with page numbering
    doc.build(elements, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer
