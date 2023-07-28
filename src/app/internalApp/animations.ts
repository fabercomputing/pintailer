import {
    trigger, state, style, transition,
    animate, group, query, stagger, keyframes
} from '@angular/animations';

export const slideIn = trigger('slideIn', [
    state('*', style({
        transform: 'translateX(100%)',
    })),
    state('in', style({
        transform: 'translateX(0)',
    })),
    state('out', style({
        transform: 'translateX(-100%)',
    })),
    transition('* => in', animate('600ms ease-in')),
    transition('in => out', animate('600ms ease-in'))
]);

export const fadeInOut = trigger('fadeInOut', [
    state('void', style({
        opacity: 0
    })),
    transition('void <=> *', animate(500)),
])

export const EnterLeave = trigger('EnterLeave', [
    state('flyIn', style({ transform: 'translateX(0)' })),
    transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.3s ease-in')
    ]),
    transition(':leave', [
        animate('0.3s ease-out', style({ transform: 'translateX(100%)' }))
    ])
])

export const EnterLeaveTop = trigger('EnterLeaveTop', [
    state('flyIn', style({ transform: 'translateX(0)' })),
    transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('0.2s ease-in')
    ]),
    transition(':leave', [
        animate('0.2s ease-out', style({ transform: 'translateX(100%)' }))
    ])
])

export const listAnimation = trigger('listAnimation', [
    transition('* => *', [

        query(':leave', [
            stagger(200, [
                animate(800, style({ opacity: 0 }))
            ])
        ], { optional: true }),
        query(':enter', [
            style({ opacity: 0 }),
            stagger(200, [
                animate(800, style({ opacity: 1 }))
            ])
        ], { optional: true })
    ])
])

export const parentAnimation = trigger('parentAnimation', [
    transition('void => *', [
        query('.child', style({ opacity: 0 })),
        query('.child', stagger('500ms', [
            animate('100ms .1s ease-out', style({ opacity: 1 }))
        ]))
    ]),
    transition('* => void', [
        query('.child', style({ opacity: 1 })),
        query('.child', stagger('-500ms', [
            animate('100ms .1s ease-out', style({ opacity: 0.2 }))
        ]))
    ])
])

export const scrollAnimation = trigger('scrollAnimation', [
    state('show', style({
        opacity: 1,
        transform: "translateX(0)"
    })),
    state('hide', style({
        opacity: 0,
        transform: "translateX(-100%)"
    })),
    transition('show => hide', animate('700ms ease-out')),
    transition('hide => show', animate('700ms ease-in'))
])